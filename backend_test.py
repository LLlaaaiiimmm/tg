#!/usr/bin/env python3
"""
Backend API Testing for FC Alexandria
Tests Player and Match model changes:
- Player number field is now Optional[int]
- Match model has new home_team_logo and away_team_logo fields
"""

import requests
import json
import sys
import os
from datetime import datetime

# Use the external URL from frontend/.env
BASE_URL = "https://ru-match-system.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

print(f"Testing backend API at: {API_URL}")
print("=" * 60)

# Test credentials
TEST_EMAIL = "fcoleksandria2133@fc.com"
TEST_PASSWORD = "Jingle2018!!!"

# Global token storage
auth_token = None

def test_login():
    """Test login endpoint and get auth token"""
    global auth_token
    print("🔐 Testing login endpoint...")
    
    try:
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get("access_token")
            print("✅ Login successful")
            print(f"Token received: {auth_token[:20]}..." if auth_token else "No token")
            return True
        else:
            print(f"❌ Login failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return False

# Removed old test functions - focusing on Player and Match model changes

def test_create_player_with_number():
    """Test creating player WITH number"""
    print("\n👤 Testing player creation WITH number...")
    
    if not auth_token:
        print("❌ No auth token available")
        return None
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    test_player = {
        "name": "Александр Иванов",
        "number": 10,
        "position": "midfielder",
        "photo_url": "https://example.com/player.jpg",
        "biography": "Опытный полузащитник",
        "goals": 5,
        "assists": 3
    }
    
    try:
        response = requests.post(f"{API_URL}/players", json=test_player, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            print("✅ Player with number created successfully")
            print(f"Player ID: {data.get('id', 'N/A')}, Number: {data.get('number', 'N/A')}")
            return data.get('id')
        else:
            print(f"❌ Failed to create player with number: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Player creation error: {str(e)}")
        return None

def test_create_player_without_number():
    """Test creating player WITHOUT number (coach/manager/representative)"""
    print("\n👤 Testing player creation WITHOUT number...")
    
    if not auth_token:
        print("❌ No auth token available")
        return None
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    test_player = {
        "name": "Сергей Петров",
        "position": "coach",
        "photo_url": "https://example.com/coach.jpg",
        "biography": "Главный тренер команды",
        "goals": 0,
        "assists": 0
    }
    
    try:
        response = requests.post(f"{API_URL}/players", json=test_player, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            print("✅ Player without number created successfully")
            print(f"Player ID: {data.get('id', 'N/A')}, Number: {data.get('number', 'N/A')}")
            return data.get('id')
        else:
            print(f"❌ Failed to create player without number: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Player creation error: {str(e)}")
        return None

def test_create_player_with_null_number():
    """Test creating player with explicit null number"""
    print("\n👤 Testing player creation with null number...")
    
    if not auth_token:
        print("❌ No auth token available")
        return None
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    test_player = {
        "name": "Михаил Сидоров",
        "number": None,
        "position": "representative",
        "photo_url": "https://example.com/rep.jpg",
        "biography": "Представитель клуба",
        "goals": 0,
        "assists": 0
    }
    
    try:
        response = requests.post(f"{API_URL}/players", json=test_player, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            print("✅ Player with null number created successfully")
            print(f"Player ID: {data.get('id', 'N/A')}, Number: {data.get('number', 'N/A')}")
            return data.get('id')
        else:
            print(f"❌ Failed to create player with null number: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Player creation error: {str(e)}")
        return None

def test_update_player_remove_number(player_id):
    """Test updating player to remove number"""
    if not player_id or not auth_token:
        print("\n⚠️ Skipping update player test - no player ID or auth token")
        return False
        
    print(f"\n✏️ Testing update player {player_id} to remove number...")
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    update_data = {
        "name": "Александр Иванов",
        "number": None,
        "position": "manager",
        "photo_url": "https://example.com/player.jpg",
        "biography": "Теперь менеджер команды",
        "goals": 5,
        "assists": 3
    }
    
    try:
        response = requests.put(f"{API_URL}/players/{player_id}", json=update_data, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Player updated successfully (number removed)")
            print(f"Updated Number: {data.get('number', 'N/A')}, Position: {data.get('position', 'N/A')}")
            return True
        else:
            print(f"❌ Failed to update player: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Player update error: {str(e)}")
        return False

def test_get_players():
    """Test getting all players to verify display"""
    print("\n📋 Testing players retrieval...")
    
    try:
        response = requests.get(f"{API_URL}/players", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} players")
            
            # Check for players without numbers
            players_without_numbers = [p for p in data if p.get('number') is None]
            players_with_numbers = [p for p in data if p.get('number') is not None]
            
            print(f"Players with numbers: {len(players_with_numbers)}")
            print(f"Players without numbers: {len(players_without_numbers)}")
            
            if players_without_numbers:
                print("Players without numbers:")
                for player in players_without_numbers[:3]:  # Show first 3
                    print(f"  - {player.get('name', 'N/A')} ({player.get('position', 'N/A')})")
            
            return True
        else:
            print(f"❌ Failed to get players: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Players retrieval error: {str(e)}")
        return False

def test_create_match_with_logos():
    """Test creating match WITH team logos"""
    print("\n⚽ Testing match creation WITH logos...")
    
    if not auth_token:
        print("❌ No auth token available")
        return None
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    test_match = {
        "date": "2024-12-01",
        "time": "15:00",
        "opponent": "ФК Спартак",
        "tournament": "Первая лига",
        "home_score": None,
        "away_score": None,
        "is_home": True,
        "status": "scheduled",
        "broadcast_link": "https://example.com/stream",
        "report_link": None,
        "home_team_logo": "https://example.com/alexandria-logo.png",
        "away_team_logo": "https://example.com/spartak-logo.png"
    }
    
    try:
        response = requests.post(f"{API_URL}/matches", json=test_match, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            print("✅ Match with logos created successfully")
            print(f"Match ID: {data.get('id', 'N/A')}")
            print(f"Home logo: {data.get('home_team_logo', 'N/A')}")
            print(f"Away logo: {data.get('away_team_logo', 'N/A')}")
            return data.get('id')
        else:
            print(f"❌ Failed to create match with logos: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Match creation error: {str(e)}")
        return None

def test_create_match_without_logos():
    """Test creating match WITHOUT logos"""
    print("\n⚽ Testing match creation WITHOUT logos...")
    
    if not auth_token:
        print("❌ No auth token available")
        return None
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    test_match = {
        "date": "2024-12-05",
        "time": "18:00",
        "opponent": "ФК Динамо",
        "tournament": "Первая лига",
        "home_score": None,
        "away_score": None,
        "is_home": False,
        "status": "scheduled",
        "broadcast_link": None,
        "report_link": None
    }
    
    try:
        response = requests.post(f"{API_URL}/matches", json=test_match, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            print("✅ Match without logos created successfully")
            print(f"Match ID: {data.get('id', 'N/A')}")
            print(f"Home logo: {data.get('home_team_logo', 'N/A')}")
            print(f"Away logo: {data.get('away_team_logo', 'N/A')}")
            return data.get('id')
        else:
            print(f"❌ Failed to create match without logos: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Match creation error: {str(e)}")
        return None

def test_update_match_add_logos(match_id):
    """Test updating match to add logos"""
    if not match_id or not auth_token:
        print("\n⚠️ Skipping update match test - no match ID or auth token")
        return False
        
    print(f"\n✏️ Testing update match {match_id} to add logos...")
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    update_data = {
        "date": "2024-12-05",
        "time": "18:00",
        "opponent": "ФК Динамо",
        "tournament": "Первая лига",
        "home_score": None,
        "away_score": None,
        "is_home": False,
        "status": "scheduled",
        "broadcast_link": None,
        "report_link": None,
        "home_team_logo": "https://example.com/alexandria-logo-updated.png",
        "away_team_logo": "https://example.com/dynamo-logo.png"
    }
    
    try:
        response = requests.put(f"{API_URL}/matches/{match_id}", json=update_data, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Match updated successfully (logos added)")
            print(f"Home logo: {data.get('home_team_logo', 'N/A')}")
            print(f"Away logo: {data.get('away_team_logo', 'N/A')}")
            return True
        else:
            print(f"❌ Failed to update match: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Match update error: {str(e)}")
        return False

def test_get_matches():
    """Test getting all matches to verify logos"""
    print("\n📋 Testing matches retrieval...")
    
    try:
        response = requests.get(f"{API_URL}/matches", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} matches")
            
            # Check for matches with logos
            matches_with_logos = [m for m in data if m.get('home_team_logo') or m.get('away_team_logo')]
            matches_without_logos = [m for m in data if not m.get('home_team_logo') and not m.get('away_team_logo')]
            
            print(f"Matches with logos: {len(matches_with_logos)}")
            print(f"Matches without logos: {len(matches_without_logos)}")
            
            if matches_with_logos:
                print("Recent matches with logos:")
                for match in matches_with_logos[:2]:  # Show first 2
                    print(f"  - vs {match.get('opponent', 'N/A')} (Home: {match.get('home_team_logo', 'None')}, Away: {match.get('away_team_logo', 'None')})")
            
            return True
        else:
            print(f"❌ Failed to get matches: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Matches retrieval error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting FC Alexandria Backend API Tests")
    print("Testing Player and Match model changes")
    print(f"Timestamp: {datetime.now()}")
    print("=" * 60)
    
    results = {
        "login": False,
        "create_player_with_number": False,
        "create_player_without_number": False,
        "create_player_with_null_number": False,
        "update_player_remove_number": False,
        "get_players": False,
        "create_match_with_logos": False,
        "create_match_without_logos": False,
        "update_match_add_logos": False,
        "get_matches": False
    }
    
    # Test login first
    results["login"] = test_login()
    
    if not results["login"]:
        print("❌ Cannot proceed without authentication")
        return 1
    
    # Test Player API changes
    player_with_number_id = test_create_player_with_number()
    results["create_player_with_number"] = player_with_number_id is not None
    
    player_without_number_id = test_create_player_without_number()
    results["create_player_without_number"] = player_without_number_id is not None
    
    player_null_number_id = test_create_player_with_null_number()
    results["create_player_with_null_number"] = player_null_number_id is not None
    
    # Test updating player to remove number
    if player_with_number_id:
        results["update_player_remove_number"] = test_update_player_remove_number(player_with_number_id)
    
    # Test getting all players
    results["get_players"] = test_get_players()
    
    # Test Match API changes
    match_with_logos_id = test_create_match_with_logos()
    results["create_match_with_logos"] = match_with_logos_id is not None
    
    match_without_logos_id = test_create_match_without_logos()
    results["create_match_without_logos"] = match_without_logos_id is not None
    
    # Test updating match to add logos
    if match_without_logos_id:
        results["update_match_add_logos"] = test_update_match_add_logos(match_without_logos_id)
    
    # Test getting all matches
    results["get_matches"] = test_get_matches()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if passed_test:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️ Some tests failed - check implementation")
        return 1

if __name__ == "__main__":
    sys.exit(main())