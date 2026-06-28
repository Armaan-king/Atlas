"""Generation router for study guides, flashcards, and quizzes."""

from fastapi import APIRouter, HTTPException

from models.schemas import (
    FlashCard,
    FlashcardsResponse,
    GenerateRequest,
    QuizQuestion,
    QuizResponse,
    StudyGuideResponse,
)
from prompts.flashcards import build_flashcards_prompt
from prompts.quiz import build_quiz_prompt
from prompts.study_guide import build_study_guide_prompt
from services.openai_client import generate_json_fallback, generate_text_fallback

try:
    from data.courses import COURSES
except ImportError:
    COURSES = []

router = APIRouter()


def _find_course(course_id: str) -> dict:
    for course in COURSES:
        if course["id"] == course_id:
            return course
    return {"id": course_id, "name": course_id.upper(), "topics": ["general topics"]}


@router.post("/generate/study-guide", response_model=StudyGuideResponse)
async def generate_study_guide(request: GenerateRequest):
    """Generate a markdown study guide with OpenAI."""
    course = _find_course(request.course_id)
    prompt = build_study_guide_prompt(
        topic=request.topic,
        course_id=request.course_id,
        course_name=course["name"],
        course_topics=course.get("topics", []),
        additional_context=request.additional_context,
    )

    try:
        content = await generate_text_fallback(
            prompt,
            system_instruction="You are an expert academic tutor creating study materials.",
        )
        return StudyGuideResponse(
            content=content,
            topic=request.topic,
            course_id=request.course_id,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Study guide generation failed: {exc}")


@router.post("/generate/flashcards", response_model=FlashcardsResponse)
async def generate_flashcards(request: GenerateRequest):
    """Generate flashcards with OpenAI."""
    course = _find_course(request.course_id)
    prompt = build_flashcards_prompt(
        topic=request.topic,
        course_id=request.course_id,
        course_name=course["name"],
        course_topics=course.get("topics", []),
        additional_context=request.additional_context,
    )

    try:
        result = await generate_json_fallback(
            prompt,
            system_instruction="You are an expert academic tutor. Generate flashcards as valid JSON only.",
        )
        cards_data = result.get("cards", result) if isinstance(result, dict) else result
        if not isinstance(cards_data, list):
            raise ValueError("Unexpected flashcard format")

        cards = [
            FlashCard(front=card["front"], back=card["back"], course_id=request.course_id)
            for card in cards_data
        ]
        return FlashcardsResponse(cards=cards, topic=request.topic, course_id=request.course_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Flashcard generation failed: {exc}")


@router.post("/generate/quiz", response_model=QuizResponse)
async def generate_quiz(request: GenerateRequest):
    """Generate quiz questions with OpenAI."""
    course = _find_course(request.course_id)
    prompt = build_quiz_prompt(
        topic=request.topic,
        course_id=request.course_id,
        course_name=course["name"],
        course_topics=course.get("topics", []),
        additional_context=request.additional_context,
    )

    try:
        result = await generate_json_fallback(
            prompt,
            system_instruction="You are an expert academic tutor. Generate quiz questions as valid JSON only.",
        )
        questions_data = result.get("questions", result) if isinstance(result, dict) else result
        if not isinstance(questions_data, list):
            raise ValueError("Unexpected quiz format")

        questions = [
            QuizQuestion(
                question=question["question"],
                options=question["options"],
                correct_index=question["correct_index"],
                explanation=question["explanation"],
            )
            for question in questions_data
        ]
        return QuizResponse(questions=questions, topic=request.topic, course_id=request.course_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {exc}")
