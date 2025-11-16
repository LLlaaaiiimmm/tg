#!/usr/bin/env python3
"""Initialize default settings for the football club"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def init_settings():
    # Get MongoDB connection
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'football_club_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if settings exist
    existing = await db.settings.find_one({"id": "settings"})
    
    settings_data = {
        "id": "settings",
        "logo_url": None,
        "stadium_name": "Стадион Темелли",
        "stadium_info": "Стадион Темелли - домашняя арена ФК Александрия. Построен в 2003 году, вместимость 12 000 зрителей. Расположен в Александрии, Крым.",
        "contact_email": "info@fc-alexandria.ru",
        "contact_phone": "+79788378777",
        "contact_address": "Александрия, Крым, ул. Стадионная, 1"
    }
    
    if existing:
        # Update existing settings
        await db.settings.update_one(
            {"id": "settings"},
            {"$set": settings_data}
        )
        print("✅ Settings updated successfully!")
    else:
        # Insert new settings
        await db.settings.insert_one(settings_data)
        print("✅ Settings created successfully!")
    
    # Verify
    result = await db.settings.find_one({"id": "settings"})
    print(f"\nCurrent settings:")
    print(f"  Stadium: {result.get('stadium_name')}")
    print(f"  Phone: {result.get('contact_phone')}")
    print(f"  Email: {result.get('contact_email')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_settings())
