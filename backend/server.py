from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import requests
from bs4 import BeautifulSoup
from apscheduler.schedulers.asyncio import AsyncIOScheduler

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    role: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class News(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str  # club, academy, partners
    image_url: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsCreate(BaseModel):
    title: str
    content: str
    category: str
    image_url: Optional[str] = None
    tags: List[str] = []

class Player(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    number: Optional[int] = None
    position: str  # goalkeeper, defender, midfielder, forward, coach, manager, representative
    photo_url: Optional[str] = None
    biography: Optional[str] = None
    goals: int = 0
    assists: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlayerCreate(BaseModel):
    name: str
    number: Optional[int] = None
    position: str
    photo_url: Optional[str] = None
    biography: Optional[str] = None
    goals: int = 0
    assists: int = 0

class Match(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    time: str
    opponent: str
    tournament: str
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    is_home: bool = True
    status: str = "scheduled"  # scheduled, finished, live
    broadcast_link: Optional[str] = None
    report_link: Optional[str] = None
    home_team_logo: Optional[str] = None
    away_team_logo: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MatchCreate(BaseModel):
    date: str
    time: str
    opponent: str
    tournament: str
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    is_home: bool = True
    status: str = "scheduled"
    broadcast_link: Optional[str] = None
    report_link: Optional[str] = None
    home_team_logo: Optional[str] = None
    away_team_logo: Optional[str] = None

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "settings"
    logo_url: Optional[str] = None
    stadium_name: Optional[str] = None
    stadium_info: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None

class SettingsUpdate(BaseModel):
    logo_url: Optional[str] = None
    stadium_name: Optional[str] = None
    stadium_info: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None

# Contact Message Models
class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str

# Standings Models
class StandingsTeam(BaseModel):
    position: int
    team: str
    games: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int

class StandingsData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "standings_first_league"
    league_name: str
    teams: List[StandingsTeam]
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# Standings parser
async def parse_standings():
    """Parse standings from ffsr.ru and save to database"""
    try:
        logger.info("Starting to parse standings from ffsr.ru")
        url = "https://ffsr.ru/standings"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the table for "ПЕРВАЯ лига"
        teams_data = []
        
        # Try to find table by text containing "ПЕРВАЯ лига"
        tables = soup.find_all('table')
        target_table = None
        
        for table in tables:
            # Look for header containing "ПЕРВАЯ лига"
            prev_elements = []
            current = table
            for _ in range(5):  # Check 5 elements before table
                current = current.find_previous()
                if current and hasattr(current, 'get_text'):
                    text = current.get_text(strip=True)
                    if 'ПЕРВАЯ' in text and 'лига' in text:
                        target_table = table
                        break
            if target_table:
                break
        
        if not target_table:
            # Fallback: try to find by class or other attributes
            logger.warning("Could not find table by header, trying alternative methods")
            # Try finding table with standings data structure
            for table in tables:
                headers = table.find_all('th')
                if len(headers) >= 8:  # Typical standings table has many columns
                    target_table = table
                    break
        
        if target_table:
            rows = target_table.find_all('tr')[1:]  # Skip header row
            
            for idx, row in enumerate(rows):
                cols = row.find_all(['td', 'th'])
                if len(cols) >= 9:  # Changed from 10 to 9
                    try:
                        # Parsing columns: Position, Team, Games, Wins, Draws, Losses, GF, GA, Points
                        # Column structure: ['#', 'Команда', 'Мматчей', 'Ввыиграно', 'Нничей', 'Ппроиграно', 'Забзабито', 'Проппропущено', 'Очки']
                        position = int(cols[0].get_text(strip=True)) if cols[0].get_text(strip=True).isdigit() else idx + 1
                        team = cols[1].get_text(strip=True) if len(cols) > 1 else ""
                        games = int(cols[2].get_text(strip=True)) if len(cols) > 2 else 0
                        wins = int(cols[3].get_text(strip=True)) if len(cols) > 3 else 0
                        draws = int(cols[4].get_text(strip=True)) if len(cols) > 4 else 0
                        losses = int(cols[5].get_text(strip=True)) if len(cols) > 5 else 0
                        goals_for = int(cols[6].get_text(strip=True)) if len(cols) > 6 else 0
                        goals_against = int(cols[7].get_text(strip=True)) if len(cols) > 7 else 0
                        goal_difference = goals_for - goals_against  # Calculate goal difference
                        points = int(cols[8].get_text(strip=True)) if len(cols) > 8 else 0
                        
                        if team and not team.startswith('#'):  # Only add if team name exists and is not header
                            teams_data.append(StandingsTeam(
                                position=position,
                                team=team,
                                games=games,
                                wins=wins,
                                draws=draws,
                                losses=losses,
                                goals_for=goals_for,
                                goals_against=goals_against,
                                goal_difference=goal_difference,
                                points=points
                            ))
                    except (ValueError, IndexError) as e:
                        logger.warning(f"Error parsing row {idx}: {e}")
                        continue
        
        if teams_data:
            # Save to database
            standings = StandingsData(
                league_name="ПЕРВАЯ лига",
                teams=teams_data,
                last_updated=datetime.now(timezone.utc)
            )
            
            doc = standings.model_dump()
            doc['last_updated'] = doc['last_updated'].isoformat()
            
            # Upsert standings data
            await db.standings.update_one(
                {"id": "standings_first_league"},
                {"$set": doc},
                upsert=True
            )
            
            logger.info(f"Successfully parsed and saved {len(teams_data)} teams to standings")
        else:
            logger.warning("No teams data found in the parsed table")
            
    except Exception as e:
        logger.error(f"Error parsing standings: {str(e)}")

# Scheduler for daily standings update
scheduler = AsyncIOScheduler()

def schedule_standings_update():
    """Schedule standings update once per day at 3 AM"""
    scheduler.add_job(
        parse_standings,
        'cron',
        hour=3,
        minute=0,
        id='standings_update',
        replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduled daily standings update at 3:00 AM")

# Basic endpoint
@api_router.get("/")
async def root():
    return {"message": "FC Alexandria API"}

# Auth endpoints
@api_router.post("/auth/login", response_model=Token)
async def login(user_login: UserLogin):
    user = await db.users.find_one({"email": user_login.email}, {"_id": 0})
    if not user or not verify_password(user_login.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/register", response_model=User)
async def register(user_create: UserCreate, current_user: str = Depends(get_current_user)):
    existing_user = await db.users.find_one({"email": user_create.email})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    user = User(
        email=user_create.email,
        password_hash=hash_password(user_create.password)
    )
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return user

@api_router.get("/auth/me")
async def get_me(current_user: str = Depends(get_current_user)):
    user = await db.users.find_one({"email": current_user}, {"_id": 0, "password_hash": 0})
    return user

# News endpoints
@api_router.get("/news", response_model=List[News])
async def get_news(category: Optional[str] = None):
    query = {"category": category} if category else {}
    news_list = await db.news.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for news in news_list:
        if isinstance(news.get('created_at'), str):
            news['created_at'] = datetime.fromisoformat(news['created_at'])
        if isinstance(news.get('updated_at'), str):
            news['updated_at'] = datetime.fromisoformat(news['updated_at'])
    return news_list

@api_router.get("/news/{news_id}", response_model=News)
async def get_news_by_id(news_id: str):
    news = await db.news.find_one({"id": news_id}, {"_id": 0})
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    if isinstance(news.get('created_at'), str):
        news['created_at'] = datetime.fromisoformat(news['created_at'])
    if isinstance(news.get('updated_at'), str):
        news['updated_at'] = datetime.fromisoformat(news['updated_at'])
    return news

@api_router.post("/news", response_model=News)
async def create_news(news_create: NewsCreate, current_user: str = Depends(get_current_user)):
    news = News(**news_create.model_dump())
    doc = news.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.news.insert_one(doc)
    return news

@api_router.put("/news/{news_id}", response_model=News)
async def update_news(news_id: str, news_update: NewsCreate, current_user: str = Depends(get_current_user)):
    existing_news = await db.news.find_one({"id": news_id})
    if not existing_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    update_data = news_update.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.news.update_one({"id": news_id}, {"$set": update_data})
    
    updated_news = await db.news.find_one({"id": news_id}, {"_id": 0})
    if isinstance(updated_news.get('created_at'), str):
        updated_news['created_at'] = datetime.fromisoformat(updated_news['created_at'])
    if isinstance(updated_news.get('updated_at'), str):
        updated_news['updated_at'] = datetime.fromisoformat(updated_news['updated_at'])
    return updated_news

@api_router.delete("/news/{news_id}")
async def delete_news(news_id: str, current_user: str = Depends(get_current_user)):
    result = await db.news.delete_one({"id": news_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News not found")
    return {"message": "News deleted successfully"}

# Players endpoints
@api_router.get("/players", response_model=List[Player])
async def get_players(position: Optional[str] = None):
    query = {"position": position} if position else {}
    players = await db.players.find(query, {"_id": 0}).sort("number", 1).to_list(1000)
    for player in players:
        if isinstance(player.get('created_at'), str):
            player['created_at'] = datetime.fromisoformat(player['created_at'])
    return players

@api_router.get("/players/{player_id}", response_model=Player)
async def get_player_by_id(player_id: str):
    player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    if isinstance(player.get('created_at'), str):
        player['created_at'] = datetime.fromisoformat(player['created_at'])
    return player

@api_router.post("/players", response_model=Player)
async def create_player(player_create: PlayerCreate, current_user: str = Depends(get_current_user)):
    player = Player(**player_create.model_dump())
    doc = player.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.players.insert_one(doc)
    return player

@api_router.put("/players/{player_id}", response_model=Player)
async def update_player(player_id: str, player_update: PlayerCreate, current_user: str = Depends(get_current_user)):
    existing_player = await db.players.find_one({"id": player_id})
    if not existing_player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    await db.players.update_one({"id": player_id}, {"$set": player_update.model_dump()})
    updated_player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if isinstance(updated_player.get('created_at'), str):
        updated_player['created_at'] = datetime.fromisoformat(updated_player['created_at'])
    return updated_player

@api_router.delete("/players/{player_id}")
async def delete_player(player_id: str, current_user: str = Depends(get_current_user)):
    result = await db.players.delete_one({"id": player_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    return {"message": "Player deleted successfully"}

# Matches endpoints
@api_router.get("/matches", response_model=List[Match])
async def get_matches(status_filter: Optional[str] = None):
    query = {"status": status_filter} if status_filter else {}
    matches = await db.matches.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    for match in matches:
        if isinstance(match.get('created_at'), str):
            match['created_at'] = datetime.fromisoformat(match['created_at'])
    return matches

@api_router.get("/matches/{match_id}", response_model=Match)
async def get_match_by_id(match_id: str):
    match = await db.matches.find_one({"id": match_id}, {"_id": 0})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if isinstance(match.get('created_at'), str):
        match['created_at'] = datetime.fromisoformat(match['created_at'])
    return match

@api_router.post("/matches", response_model=Match)
async def create_match(match_create: MatchCreate, current_user: str = Depends(get_current_user)):
    match = Match(**match_create.model_dump())
    doc = match.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.matches.insert_one(doc)
    return match

@api_router.put("/matches/{match_id}", response_model=Match)
async def update_match(match_id: str, match_update: MatchCreate, current_user: str = Depends(get_current_user)):
    existing_match = await db.matches.find_one({"id": match_id})
    if not existing_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    await db.matches.update_one({"id": match_id}, {"$set": match_update.model_dump()})
    updated_match = await db.matches.find_one({"id": match_id}, {"_id": 0})
    if isinstance(updated_match.get('created_at'), str):
        updated_match['created_at'] = datetime.fromisoformat(updated_match['created_at'])
    return updated_match

@api_router.delete("/matches/{match_id}")
async def delete_match(match_id: str, current_user: str = Depends(get_current_user)):
    result = await db.matches.delete_one({"id": match_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Match not found")
    return {"message": "Match deleted successfully"}

# Settings endpoints
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not settings:
        default_settings = Settings()
        await db.settings.insert_one(default_settings.model_dump())
        return default_settings
    return settings

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings_update: SettingsUpdate, current_user: str = Depends(get_current_user)):
    update_data = {k: v for k, v in settings_update.model_dump().items() if v is not None}
    if update_data:
        await db.settings.update_one(
            {"id": "settings"},
            {"$set": update_data},
            upsert=True
        )
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    return settings

# Contact Messages endpoints
@api_router.post("/contacts", response_model=ContactMessage)
async def create_contact_message(contact_create: ContactMessageCreate):
    """Create a new contact message (public endpoint)"""
    contact = ContactMessage(**contact_create.model_dump())
    doc = contact.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_messages.insert_one(doc)
    logger.info(f"New contact message from {contact.email}")
    return contact

@api_router.get("/contacts", response_model=List[ContactMessage])
async def get_contact_messages(current_user: str = Depends(get_current_user)):
    """Get all contact messages (admin only)"""
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    return messages

@api_router.delete("/contacts/{message_id}")
async def delete_contact_message(message_id: str, current_user: str = Depends(get_current_user)):
    """Delete a contact message (admin only)"""
    result = await db.contact_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Contact message deleted successfully"}

@api_router.patch("/contacts/{message_id}/read")
async def mark_message_as_read(message_id: str, current_user: str = Depends(get_current_user)):
    """Mark a contact message as read (admin only)"""
    result = await db.contact_messages.update_one(
        {"id": message_id},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}

# Standings endpoint
@api_router.get("/standings")
async def get_standings():
    """Get the current standings table"""
    standings = await db.standings.find_one({"id": "standings_first_league"}, {"_id": 0})
    if not standings:
        # If no standings in DB, try to parse them now
        await parse_standings()
        standings = await db.standings.find_one({"id": "standings_first_league"}, {"_id": 0})
        if not standings:
            raise HTTPException(status_code=404, detail="Standings not available")
    
    # Convert datetime strings back to datetime objects if needed
    if isinstance(standings.get('last_updated'), str):
        standings['last_updated'] = datetime.fromisoformat(standings['last_updated'])
    
    return standings

# Initialize admin user on startup
@app.on_event("startup")
async def startup_event():
    # Create default admin user
    admin_email = "fcoleksandria2133@fc.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin_user = User(
            email=admin_email,
            password_hash=hash_password("Jingle2018!!!")
        )
        doc = admin_user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        logger.info(f"Default admin user created: {admin_email}")
    
    # Initialize scheduler for daily standings updates
    schedule_standings_update()
    
    # Parse standings if not in database
    existing_standings = await db.standings.find_one({"id": "standings_first_league"})
    if not existing_standings:
        logger.info("No standings in database, parsing now...")
        await parse_standings()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    if scheduler.running:
        scheduler.shutdown()
    client.close()