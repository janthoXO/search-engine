```bash
source venv/bin/activate
cp .env.example .env   # fill in your values
scrapy crawl generic -s JOBDIR=crawls/generic-1
```