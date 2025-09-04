# Samsa: An Essay Generator 📗
Use this app to generate an essay about books you've uploaded through an analytical lens of your choosing.

<img width="1436" height="784" alt="image" src="https://github.com/user-attachments/assets/fed6d897-1355-416d-944f-f590509c1990" />


## Prerequisites

Clone the backend python source code in a sibling repo.

```bash
git clone https://github.com/bsaff/samsa-ai
```

Follow setup instructions in [samsa-ai](https://github.com/bsaff/samsa-ai/) before continuing.


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

