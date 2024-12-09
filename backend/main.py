from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-railway-frontend-domain.up.railway.app",
        "http://localhost:3000"  # for local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 