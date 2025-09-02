# Samsa: An Essay Generator 📗
Use this app to generate an essay about books you've uploaded through an analytical lens of your choosing.

## Prerequisites

Clone the backend python source code in a sibling repo.

```bash
git clone https://github.com/bsaff/samsa-ai
```

Follow setup instructions in samsa-ai before continuing.


Back in samsa-ui, you may have to symlink to the python project within your scripts directory:
```bash
# samsa-ui/scripts
ln -s ../../samsa-ai/src/main.py ingest_books.py
ln -s ../../samsa-ai/src/.venv/bin/python.3.9 python
```

## Getting Started

Run the development server:
```bash
npm run dev
```

