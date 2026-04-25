import os
from dotenv import load_dotenv

load_dotenv()

BOT_NAME = "searchcrawler"
SPIDER_MODULES = ["searchcrawler.spiders"]
NEWSPIDER_MODULE = "searchcrawler.spiders"

# Politeness — respect the sites being crawled
ROBOTSTXT_OBEY = True
DOWNLOAD_DELAY = 1.5  # seconds between requests
RANDOMIZE_DOWNLOAD_DELAY = True  # adds jitter: 0.5x to 1.5x of DOWNLOAD_DELAY
CONCURRENT_REQUESTS = 4  # max parallel requests
CONCURRENT_REQUESTS_PER_DOMAIN = 2  # max parallel requests per domain
AUTOTHROTTLE_ENABLED = True  # automatically adjusts delay based on server load
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10

# Depth
DEPTH_LIMIT = int(os.getenv("CRAWL_DEPTH", "2"))

# Item pipeline — enable our custom Elasticsearch pipeline
ITEM_PIPELINES = {
    "searchcrawler.pipelines.ElasticsearchPipeline": 300,
}

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
