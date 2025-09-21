from django.shortcuts import render, redirect
from .models import Location
from .forms import LocationForm
import json

def map_view(request):
    if request.method == "POST":
        form = LocationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("map")  # refresh after saving
    else:
        form = LocationForm()

    locations = list(Location.objects.values("name", "description", "latitude", "longitude"))
    context = {
        "form": form,
        "locations": json.dumps(locations),
    }
    return render(request, "routes/routes.html", context)
