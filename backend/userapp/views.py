from django.http import JsonResponse


def hello(request):
    return JsonResponse({"message": "Hello from the user app", "status": "ok"})
