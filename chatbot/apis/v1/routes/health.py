from dependency_injector.wiring import inject
from fastapi import APIRouter, Response

router = APIRouter(
    prefix="/health",
    tags=["Health"],
    responses={404: {"description": "Not found"}}
)


@router.get(
    path="",
    tags=["Health"],
)
@inject
async def health() -> Response:
    return Response(
        status_code=200
    )
