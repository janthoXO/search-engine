import os
import logging
from elasticsearch import Elasticsearch, helpers
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class ElasticsearchPipeline:

    def open_spider(self, spider):
        self.es = Elasticsearch(
            hosts=[os.getenv("ES_HOST", "http://localhost:9200")],
            basic_auth=(
                os.getenv("ES_USERNAME", "elastic"),
                os.getenv("ES_PASSWORD", "changeme"),
            ),
        )
        self.index = os.getenv("ES_INDEX", "pages")
        self.buffer = []
        self.buffer_size = 50  # bulk-insert every 50 documents

        self._ensure_index()

    def _ensure_index(self):
        """Create the index with explicit mappings if it doesn't exist."""
        if not self.es.indices.exists(index=self.index):
            self.es.indices.create(
                index=self.index,
                body={
                    "mappings": {
                        "properties": {
                            "url": {"type": "keyword"},
                            "title": {"type": "text", "analyzer": "english"},
                            "body": {"type": "text", "analyzer": "english"},
                            "crawled_at": {"type": "date"},
                        }
                    }
                },
            )
            logger.info(f"Created Elasticsearch index: {self.index}")

    def process_item(self, item, spider):
        self.buffer.append(
            {
                "_index": self.index,
                "_id": item["url"],  # deduplicate by URL
                "_source": dict(item),
            }
        )

        if len(self.buffer) >= self.buffer_size:
            self._flush()

        return item

    def _flush(self):
        if not self.buffer:
            return
        success, errors = helpers.bulk(self.es, self.buffer, raise_on_error=False)
        if errors:
            logger.error(f"Elasticsearch bulk errors: {errors}")
        logger.info(f"Indexed {success} documents")
        self.buffer = []

    def close_spider(self, spider):
        self._flush()  # flush remaining items
        self.es.close()
