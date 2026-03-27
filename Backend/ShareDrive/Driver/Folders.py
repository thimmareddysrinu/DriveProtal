import uuid

def rc_book_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"driver_vehicles/driver_{instance.driver.id}/vehicle_{instance.id}/rc_book/{filename}"


def insurance_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"driver_vehicles/driver_{instance.driver.id}/vehicle_{instance.id}/insurance/{filename}"


def pollution_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"driver_vehicles/driver_{instance.driver.id}/vehicle_{instance.id}/pollution/{filename}"


def vehicle_photo_upload_path(instance, filename):
    return f"vehicles/driver_{instance.driver.id}/{filename}"

