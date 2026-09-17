import os, sys, django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shiuli_backend.settings')
django.setup()

from apps.accounts.models import User
from apps.custom_orders.models import CustomRequest

print("=== ALL USERS IN DB ===")
for u in User.objects.all():
    print(f"User ID={u.id}, Username={u.username}, Role={u.role}, Email={u.email}")

print("\n=== ALL CUSTOM REQUESTS IN DB ===")
reqs = CustomRequest.objects.all()
print(f"Total Custom Requests in DB: {reqs.count()}")
for r in reqs:
    client_name = getattr(r, 'client_name', None) or (r.user.username if getattr(r, 'user', None) else 'No User')
    client_email = getattr(r, 'client_email', None) or (r.user.email if getattr(r, 'user', None) else 'No Email')
    user_id = r.user.id if getattr(r, 'user', None) else None
    assigned_staff = getattr(r, 'assigned_staff', None)
    staff_str = assigned_staff.username if assigned_staff else 'Unassigned'
    print(f"ID={r.id}, TicketID={getattr(r, 'ticket_id', None)}, ClientName={client_name}, ClientEmail={client_email}, UserID={user_id}, Status={r.status}, Price={getattr(r, 'agreed_price', None) or getattr(r, 'estimated_price_shown', None)}, Assigned={staff_str}")
