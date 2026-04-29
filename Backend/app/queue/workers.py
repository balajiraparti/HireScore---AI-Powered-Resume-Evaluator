from typing import TypedDict,List
from langchain_groq import ChatGroq
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from typing import Literal
from langchain_core.prompts import ChatPromptTemplate
load_dotenv()
from langgraph.graph import START,StateGraph,END
from langchain_openai import ChatOpenAI


import os

from ..db.collections.files import files_collection
from bson import ObjectId
from pdf2image import convert_from_path
import os
from dotenv import load_dotenv
import base64
from groq import Groq
load_dotenv()
from openai import OpenAI

# client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
client= OpenAI()
class QueryRewriteResponse(BaseModel):
        enhanced_jd:str
        keywords:List[str]
class SWOTSchema(BaseModel):
        strength: str
        weaknesses: str
        improvements: str
        score:float
class State(TypedDict):
        resume_description: str
        JD: str 
        enhanced_jd: str
        keywords: List[str]
        strength: str
        weaknesses: str
        improvements: str
        score:float
# Function to encode the image


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")
    
    
async def process_file(id: str, file_path: str):
    print("processing file")
    
    pages = convert_from_path(file_path)
    await files_collection.update_one({"_id": ObjectId(id)}, {
        "$set": {
            "status": "converting pdf to images"
        }
    })
    images = []
    db_file = await files_collection.find_one({"_id": ObjectId(id)})
    for i, page in enumerate(pages):
        image_save_path = f"/mnt/uploads/images/{id}/image-{i}.jpg"
        os.makedirs(os.path.dirname(image_save_path), exist_ok=True)
        page.save(image_save_path, 'JPEG')
        images.append(image_save_path)
    await files_collection.update_one({"_id": ObjectId(id)}, {
        "$set": {
            "status": "converting pdf to images success"
        }
    })
    image_base64 = [encode_image(img) for img in images]
    response = client.responses.create(
    model="gpt-4o",
    input=[
        {
            "role": "user",
            "content": [
                { "type": "input_text", "text": "Extract skills, experience and projects from this image" },
                {
                    "type": "input_image",
                    "image_url": f"data:image/jpeg;base64,{image_base64}",
                },
            ],
        }
    ],
)

 
    resume_description=response.output_text
    # search = DuckDuckGoSearchRun()
    # class DetectWebSearchSchema(BaseModel):
    #     is_web_search:bool
    
    def jd_rewrite(state:State):
        JD=state.get("JD")
        
        llm=ChatOpenAI(model="gpt-4o",temperature=0)
        messages =ChatPromptTemplate.from_messages( [
        (
            "system",
            """You are expert HR manager.Your job is to analyze the given job description and rewrite/summarize the JD in short and clear steps. Also extract important Keywords from JD that could help while recruiting eligible candidate  
            Return the output in JSON format like:
    {{
    "enhanced_jd": str,
    "keywords": List of keywords
    }}

    Only return valid JSON.
            """,
        ),
        ("human", "Job description: {jd}"),
    ])
        llm_with_structured_output=messages | llm.with_structured_output(QueryRewriteResponse,method="json_mode")
        ai_msg = llm_with_structured_output.invoke({"jd":JD})
        state['enhanced_jd']=ai_msg.enhanced_jd
        state['keywords']=ai_msg.keywords
        return state






    def evaluation(state:State):
            JD=state.get('enhanced_jd')
            resume_description=state.get("resume_description")
            llm=ChatOpenAI(model="gpt-4o",temperature=0)
            messages = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are expert AI Resume Analyzer.Your job is to check if the resume description fits for given job description.
            Determine Strength and Weaknesses from given resume description.Also suggest improvements the candidate shoudld do to enhance their resume.
            strength:
            - what are strongest skills candidate has that could help them land a job based on JD 
            
            weaknesses:
            - what are the areas where candidate lacks skills that could in turn lead to rejection
            
            improvements:
            - If the resume description doesn't match with the job description then humbly say sorry, We can't hire you with the reason.If it does match with the resume description then say congratulations! we'd like to offer a postion for given job role and ready make to the next interview round
            - Analyze and identify potential skill gaps in given resume and suggest actionable steps about what the candidate should do next in order to improve resume
            - Explain what is missing in resume
        
            
            score:
            - Rate the resume description on scale of 1 to 10
            - Lowest(1-3) means resume is not tailored as per job description and requires significant improvements
            - Highest(8-10) means resume perfectly tailored as per industry requirement
            - Moderate(4-7) means resume partially tailored and still requires improvements
            
            Return the output in JSON format like:
    {{
    "strength": str,
    "weaknesses":str,
    "improvements":str,
    "score":float
    }}

    Only return valid JSON.
            """,
        ),
        ("human", "Job_description: {jd} \n\n resume_description:{description}"),
    ])
            llm_with_structured_output=messages | llm.with_structured_output(SWOTSchema,method="json_mode")
            ai_msg = llm_with_structured_output.invoke({"jd":JD,"description":resume_description})
            state['strength']=ai_msg.strength
            state['weaknesses']=ai_msg.weaknesses
            state['improvements']=ai_msg.improvements
            state['score']=ai_msg.score
            return state
    
            
    graph_builder=StateGraph(State)
    graph_builder.add_node("jd_rewrite",jd_rewrite)
    graph_builder.add_node("evaluation",evaluation)
    graph_builder.add_edge(START,"jd_rewrite")
    graph_builder.add_edge("jd_rewrite","evaluation")
    graph_builder.add_edge("evaluation",END)
    graph=graph_builder.compile()
    png_bytes = graph.get_graph().draw_mermaid_png()
    with open("langgraph_visual.png", "wb") as f:
        f.write(png_bytes)
    
    state={
                "resume_description":resume_description,
                "JD": db_file['job_description'],
                "enhanced_jd":"",
                "keywords":[],
                "strength":"",
                "weaknesses":"",
                "improvements": "",
                "score":0.0
            }
    result=graph.invoke(state)
    await files_collection.update_one({"_id": ObjectId(id)}, {
            "$set": {
                "status": "processed",
                "strength":  result['strength'],
                "weaknesses":result['weaknesses'],
                "improvements":result['improvements'],
                "score": result['score']
            }
        })
    
# def encode_image(image_path):
#     with open(image_path, "rb") as image_file:
#         return base64.b64encode(image_file.read()).decode("utf-8")
    
    
# async def process_file(id: str, file_path: str):
#     print("processing file")
    
#     pages = convert_from_path(file_path)
#     await files_collection.update_one({"_id": ObjectId(id)}, {
#         "$set": {
#             "status": "converting pdf to images"
#         }
#     })
#     images = []
    
#     for i, page in enumerate(pages):
#         image_save_path = f"/mnt/uploads/images/{id}/image-{i}.jpg"
#         os.makedirs(os.path.dirname(image_save_path), exist_ok=True)
#         page.save(image_save_path, 'JPEG')
#         images.append(image_save_path)
#     await files_collection.update_one({"_id": ObjectId(id)}, {
#         "$set": {
#             "status": "converting pdf to images success"
#         }
#     })
#     image_base64 = [encode_image(img) for img in images]
#     completion = client.chat.completions.create(
#         model="meta-llama/llama-4-scout-17b-16e-instruct",
#         messages=[
#             {
#                 "role": "user",
#                 "content": [
#                     {
#                         "type": "text",
#                         "text": "What's in this image?"
#                     },
#                     {
#                         "type": "image_url",
#                         "image_url": {
                                # flake8: noqa
#                             "url": f"data:image/jpeg;base64,{image_base64[0]}"
#                         }
#                     }
#                 ]
#             }
#         ],
#         temperature=1,
#         max_completion_tokens=1024,
#         top_p=1,
#         stream=False,
#         stop=None,
#         )

#     print(completion.choices[0].message)
#     await files_collection.update_one({"_id": ObjectId(id)}, {
#         "$set": {
#             "status": "processed",
#             "result":  completion.choices[0].message
#         }
#     })