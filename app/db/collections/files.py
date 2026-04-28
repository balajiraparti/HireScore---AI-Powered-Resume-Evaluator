from pydantic import Field
from typing import TypedDict, Optional
from pymongo.asynchronous.collection import AsyncCollection
from ..db import database


class FileSchema(TypedDict):
    name: str = Field(..., description="Name of the file")
    status: str = Field(..., description="Status of the file")
    job_description: str = Field(..., description="JD")
    strength: Optional[str] = None
    weaknesses: Optional[str] = None
    improvements: Optional[str] = None
    score: Optional[float] = None


COLLECTION_NAME = "files"


files_collection: AsyncCollection = database[COLLECTION_NAME]