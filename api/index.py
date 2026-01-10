from fastapi import FastAPI
import sys
import os

# Add the parent directory to the system path to allow importing 'server'
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from server.main import app

# Vercel Serverless Function Entry Point
# It looks for 'app'
