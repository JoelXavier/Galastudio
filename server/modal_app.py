import modal
from modal import App, Image, asgi_app
import os

# Define the container image with necessary scientific packages
# gala, astropy, and numpy are the heavy hitters here.
image = (
    Image.debian_slim()
    # Install system dependencies if required by gala/astropy build
    .apt_install("libgsl-dev") 
    .pip_install(
        "gala",
        "astropy",
        "fastapi",
        "uvicorn",
        "pydantic",
        "numpy",
        "slowapi",
        "scipy"
    )
    # Mount the current directory so main.py and other modules are visible
    .add_local_dir("./", remote_path="/root")
)

app = App("gala-studio-backend", image=image)


@app.function(
    image=image,
)
@asgi_app()
def fastapi_modal():
    # We import inside the function to ensure it runs in the container
    # sys path hack might be needed if /root is not in path, but usually it is.
    import sys
    sys.path.append("/root")
    from main import app as web_app
    return web_app
