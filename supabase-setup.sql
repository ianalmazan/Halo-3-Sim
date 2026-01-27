-- =============================================
-- HALO 3 GAME SIMULATOR - SUPABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- Enums
CREATE TYPE game_status AS ENUM ('setup', 'in_progress', 'completed');
CREATE TYPE achievement_type AS ENUM ('medal', 'career', 'skill');

-- Core Tables

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gamertag VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    service_tag VARCHAR(4) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL
);

CREATE TABLE maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    max_players INTEGER NOT NULL DEFAULT 16
);

CREATE TABLE game_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_team_based BOOLEAN NOT NULL DEFAULT true,
    score_to_win INTEGER NOT NULL DEFAULT 50
);

CREATE TABLE weapons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    damage_type VARCHAR(50) NOT NULL
);

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    type achievement_type NOT NULL DEFAULT 'medal',
    icon_url TEXT,
    requirement INTEGER NOT NULL DEFAULT 1
);

-- Game Tables

CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL REFERENCES maps(id),
    game_type_id UUID NOT NULL REFERENCES game_types(id),
    status game_status NOT NULL DEFAULT 'setup',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    winning_team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    user_id UUID NOT NULL REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    joined_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE game_team_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    score INTEGER NOT NULL DEFAULT 0,
    UNIQUE(game_id, team_id)
);

CREATE TABLE game_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    killer_id UUID NOT NULL REFERENCES users(id),
    victim_id UUID NOT NULL REFERENCES users(id),
    weapon_id UUID NOT NULL REFERENCES weapons(id),
    is_headshot BOOLEAN NOT NULL DEFAULT false,
    is_melee BOOLEAN NOT NULL DEFAULT false,
    is_assassination BOOLEAN NOT NULL DEFAULT false,
    is_grenade BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Stats Tables

CREATE TABLE player_game_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    user_id UUID NOT NULL REFERENCES users(id),
    kills INTEGER NOT NULL DEFAULT 0,
    deaths INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    headshots INTEGER NOT NULL DEFAULT 0,
    melee_kills INTEGER NOT NULL DEFAULT 0,
    grenade_kills INTEGER NOT NULL DEFAULT 0,
    UNIQUE(game_id, user_id)
);

CREATE TABLE player_lifetime_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    total_kills INTEGER NOT NULL DEFAULT 0,
    total_deaths INTEGER NOT NULL DEFAULT 0,
    total_assists INTEGER NOT NULL DEFAULT 0,
    total_headshots INTEGER NOT NULL DEFAULT 0,
    total_games INTEGER NOT NULL DEFAULT 0,
    games_won INTEGER NOT NULL DEFAULT 0,
    total_playtime_seconds INTEGER NOT NULL DEFAULT 0,
    highest_kill_streak INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE player_weapon_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    weapon_id UUID NOT NULL REFERENCES weapons(id),
    kills INTEGER NOT NULL DEFAULT 0,
    headshots INTEGER NOT NULL DEFAULT 0,
    shots_fired INTEGER NOT NULL DEFAULT 0,
    shots_hit INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, weapon_id)
);

CREATE TABLE player_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    game_id UUID REFERENCES games(id),
    unlocked_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE kill_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    user_id UUID NOT NULL REFERENCES users(id),
    streak_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    started_at TIMESTAMP DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_game_events_game_id ON game_events(game_id);
CREATE INDEX idx_game_events_killer_id ON game_events(killer_id);
CREATE INDEX idx_game_events_created_at ON game_events(created_at);
CREATE INDEX idx_player_game_stats_user_id ON player_game_stats(user_id);
CREATE INDEX idx_kill_streaks_active ON kill_streaks(game_id, user_id, is_active);

-- =====================
-- FUNCTIONS
-- =====================

CREATE OR REPLACE FUNCTION calculate_kd_ratio(kills INTEGER, deaths INTEGER)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
    IF deaths = 0 THEN RETURN kills::DECIMAL; END IF;
    RETURN ROUND(kills::DECIMAL / deaths::DECIMAL, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_win_percentage(wins INTEGER, total_games INTEGER)
RETURNS DECIMAL(5, 2) AS $$
BEGIN
    IF total_games = 0 THEN RETURN 0; END IF;
    RETURN ROUND((wins::DECIMAL / total_games::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_accuracy(hits INTEGER, shots INTEGER)
RETURNS DECIMAL(5, 2) AS $$
BEGIN
    IF shots = 0 THEN RETURN 0; END IF;
    RETURN ROUND((hits::DECIMAL / shots::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_player_stats(p_user_id UUID)
RETURNS TABLE (
    gamertag VARCHAR, service_tag VARCHAR, total_kills INTEGER, total_deaths INTEGER,
    kd_ratio DECIMAL, total_games INTEGER, games_won INTEGER, win_percentage DECIMAL,
    total_headshots INTEGER, highest_kill_streak INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.gamertag, u.service_tag, pls.total_kills, pls.total_deaths,
        calculate_kd_ratio(pls.total_kills, pls.total_deaths), pls.total_games, pls.games_won,
        calculate_win_percentage(pls.games_won, pls.total_games), pls.total_headshots, pls.highest_kill_streak
    FROM users u JOIN player_lifetime_stats pls ON u.id = pls.user_id WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_player_weapon_stats(p_user_id UUID)
RETURNS TABLE (weapon_name VARCHAR, kills INTEGER, headshots INTEGER, accuracy DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT w.name, pws.kills, pws.headshots, calculate_accuracy(pws.shots_hit, pws.shots_fired)
    FROM player_weapon_stats pws JOIN weapons w ON pws.weapon_id = w.id
    WHERE pws.user_id = p_user_id ORDER BY pws.kills DESC;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION record_kill(
    p_game_id UUID, p_killer_id UUID, p_victim_id UUID, p_weapon_id UUID,
    p_is_headshot BOOLEAN DEFAULT false, p_is_melee BOOLEAN DEFAULT false,
    p_is_assassination BOOLEAN DEFAULT false, p_is_grenade BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE v_event_id UUID;
BEGIN
    INSERT INTO game_events (game_id, killer_id, victim_id, weapon_id, is_headshot, is_melee, is_assassination, is_grenade)
    VALUES (p_game_id, p_killer_id, p_victim_id, p_weapon_id, p_is_headshot, p_is_melee, p_is_assassination, p_is_grenade)
    RETURNING id INTO v_event_id;
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION start_game(p_game_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE games SET status = 'in_progress', started_at = NOW() WHERE id = p_game_id AND status = 'setup';
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION end_game(p_game_id UUID) RETURNS UUID AS $$
DECLARE v_winning_team_id UUID;
BEGIN
    SELECT team_id INTO v_winning_team_id FROM game_team_scores WHERE game_id = p_game_id ORDER BY score DESC LIMIT 1;
    UPDATE games SET status = 'completed', ended_at = NOW(), winning_team_id = v_winning_team_id
    WHERE id = p_game_id AND status = 'in_progress';
    RETURN v_winning_team_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_kill_streak(p_game_id UUID, p_user_id UUID, p_increment BOOLEAN) RETURNS INTEGER AS $$
DECLARE v_streak_count INTEGER; v_streak_id UUID;
BEGIN
    IF p_increment THEN
        SELECT id, streak_count INTO v_streak_id, v_streak_count FROM kill_streaks
        WHERE game_id = p_game_id AND user_id = p_user_id AND is_active = true;
        IF v_streak_id IS NULL THEN
            INSERT INTO kill_streaks (game_id, user_id, streak_count, is_active) VALUES (p_game_id, p_user_id, 1, true)
            RETURNING streak_count INTO v_streak_count;
        ELSE
            UPDATE kill_streaks SET streak_count = streak_count + 1 WHERE id = v_streak_id RETURNING streak_count INTO v_streak_count;
        END IF;
    ELSE
        UPDATE kill_streaks SET is_active = false, ended_at = NOW()
        WHERE game_id = p_game_id AND user_id = p_user_id AND is_active = true RETURNING streak_count INTO v_streak_count;
        v_streak_count := COALESCE(v_streak_count, 0);
    END IF;
    RETURN v_streak_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_game_summary(p_game_id UUID)
RETURNS TABLE (gamertag VARCHAR, team_name VARCHAR, team_color VARCHAR, kills INTEGER, deaths INTEGER, kd_ratio DECIMAL, headshots INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT u.gamertag, t.name, t.color, pgs.kills, pgs.deaths, calculate_kd_ratio(pgs.kills, pgs.deaths), pgs.headshots
    FROM player_game_stats pgs
    JOIN users u ON pgs.user_id = u.id
    JOIN game_players gp ON gp.game_id = pgs.game_id AND gp.user_id = pgs.user_id
    LEFT JOIN teams t ON gp.team_id = t.id
    WHERE pgs.game_id = p_game_id ORDER BY pgs.kills DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================
-- TRIGGERS
-- =====================

CREATE OR REPLACE FUNCTION fn_game_events_stats() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_game_stats (game_id, user_id, kills, headshots, melee_kills, grenade_kills)
    VALUES (NEW.game_id, NEW.killer_id, 1,
            CASE WHEN NEW.is_headshot THEN 1 ELSE 0 END,
            CASE WHEN NEW.is_melee THEN 1 ELSE 0 END,
            CASE WHEN NEW.is_grenade THEN 1 ELSE 0 END)
    ON CONFLICT (game_id, user_id) DO UPDATE SET
        kills = player_game_stats.kills + 1,
        headshots = player_game_stats.headshots + CASE WHEN NEW.is_headshot THEN 1 ELSE 0 END,
        melee_kills = player_game_stats.melee_kills + CASE WHEN NEW.is_melee THEN 1 ELSE 0 END,
        grenade_kills = player_game_stats.grenade_kills + CASE WHEN NEW.is_grenade THEN 1 ELSE 0 END;
    INSERT INTO player_game_stats (game_id, user_id, deaths) VALUES (NEW.game_id, NEW.victim_id, 1)
    ON CONFLICT (game_id, user_id) DO UPDATE SET deaths = player_game_stats.deaths + 1;
    PERFORM update_kill_streak(NEW.game_id, NEW.killer_id, true);
    PERFORM update_kill_streak(NEW.game_id, NEW.victim_id, false);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_game_events_stats AFTER INSERT ON game_events FOR EACH ROW EXECUTE FUNCTION fn_game_events_stats();

CREATE OR REPLACE FUNCTION fn_team_score_update() RETURNS TRIGGER AS $$
DECLARE v_killer_team_id UUID;
BEGIN
    SELECT team_id INTO v_killer_team_id FROM game_players WHERE game_id = NEW.game_id AND user_id = NEW.killer_id;
    IF v_killer_team_id IS NOT NULL THEN
        UPDATE game_team_scores SET score = score + 1 WHERE game_id = NEW.game_id AND team_id = v_killer_team_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_team_score_update AFTER INSERT ON game_events FOR EACH ROW EXECUTE FUNCTION fn_team_score_update();

CREATE OR REPLACE FUNCTION fn_weapon_stats_update() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_weapon_stats (user_id, weapon_id, kills, headshots, shots_hit)
    VALUES (NEW.killer_id, NEW.weapon_id, 1, CASE WHEN NEW.is_headshot THEN 1 ELSE 0 END, 1)
    ON CONFLICT (user_id, weapon_id) DO UPDATE SET
        kills = player_weapon_stats.kills + 1,
        headshots = player_weapon_stats.headshots + CASE WHEN NEW.is_headshot THEN 1 ELSE 0 END,
        shots_hit = player_weapon_stats.shots_hit + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_weapon_stats_update AFTER INSERT ON game_events FOR EACH ROW EXECUTE FUNCTION fn_weapon_stats_update();

CREATE OR REPLACE FUNCTION fn_lifetime_stats_on_game_end() RETURNS TRIGGER AS $$
DECLARE v_player RECORD; v_playtime INTEGER;
BEGIN
    IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
        v_playtime := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
        FOR v_player IN
            SELECT pgs.user_id, pgs.kills, pgs.deaths, pgs.assists, pgs.headshots, gp.team_id,
                   CASE WHEN gp.team_id = NEW.winning_team_id THEN 1 ELSE 0 END as won
            FROM player_game_stats pgs
            JOIN game_players gp ON gp.game_id = pgs.game_id AND gp.user_id = pgs.user_id
            WHERE pgs.game_id = NEW.id
        LOOP
            UPDATE player_lifetime_stats SET
                total_kills = total_kills + v_player.kills, total_deaths = total_deaths + v_player.deaths,
                total_assists = total_assists + v_player.assists, total_headshots = total_headshots + v_player.headshots,
                total_games = total_games + 1, games_won = games_won + v_player.won,
                total_playtime_seconds = total_playtime_seconds + COALESCE(v_playtime, 0)
            WHERE user_id = v_player.user_id;
        END LOOP;
        UPDATE player_lifetime_stats pls SET highest_kill_streak = GREATEST(pls.highest_kill_streak, ks.max_streak)
        FROM (SELECT user_id, MAX(streak_count) as max_streak FROM kill_streaks WHERE game_id = NEW.id GROUP BY user_id) ks
        WHERE pls.user_id = ks.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lifetime_stats_on_game_end AFTER UPDATE ON games FOR EACH ROW EXECUTE FUNCTION fn_lifetime_stats_on_game_end();

CREATE OR REPLACE FUNCTION fn_award_achievements() RETURNS TRIGGER AS $$
DECLARE v_streak_count INTEGER; v_achievement RECORD;
BEGIN
    IF NEW.is_headshot THEN
        FOR v_achievement IN SELECT id FROM achievements WHERE name = 'Headshot' LOOP
            INSERT INTO player_achievements (user_id, achievement_id, game_id) VALUES (NEW.killer_id, v_achievement.id, NEW.game_id) ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
    IF NEW.is_assassination THEN
        FOR v_achievement IN SELECT id FROM achievements WHERE name = 'Assassination' LOOP
            INSERT INTO player_achievements (user_id, achievement_id, game_id) VALUES (NEW.killer_id, v_achievement.id, NEW.game_id) ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
    SELECT streak_count INTO v_streak_count FROM kill_streaks WHERE game_id = NEW.game_id AND user_id = NEW.killer_id AND is_active = true;
    IF v_streak_count = 2 THEN
        FOR v_achievement IN SELECT id FROM achievements WHERE name = 'Double Kill' LOOP
            INSERT INTO player_achievements (user_id, achievement_id, game_id) VALUES (NEW.killer_id, v_achievement.id, NEW.game_id);
        END LOOP;
    END IF;
    IF v_streak_count = 3 THEN
        FOR v_achievement IN SELECT id FROM achievements WHERE name = 'Triple Kill' LOOP
            INSERT INTO player_achievements (user_id, achievement_id, game_id) VALUES (NEW.killer_id, v_achievement.id, NEW.game_id);
        END LOOP;
    END IF;
    IF v_streak_count = 4 THEN
        FOR v_achievement IN SELECT id FROM achievements WHERE name = 'Overkill' LOOP
            INSERT INTO player_achievements (user_id, achievement_id, game_id) VALUES (NEW.killer_id, v_achievement.id, NEW.game_id);
        END LOOP;
    END IF;
    IF v_streak_count = 5 THEN
        FOR v_achievement IN SELECT id FROM achievements WHERE name = 'Killing Spree' LOOP
            INSERT INTO player_achievements (user_id, achievement_id, game_id) VALUES (NEW.killer_id, v_achievement.id, NEW.game_id);
        END LOOP;
    END IF;
    IF v_streak_count = 10 THEN
        FOR v_achievement IN SELECT id FROM achievements WHERE name = 'Killing Frenzy' LOOP
            INSERT INTO player_achievements (user_id, achievement_id, game_id) VALUES (NEW.killer_id, v_achievement.id, NEW.game_id);
        END LOOP;
    END IF;
    IF v_streak_count = 15 THEN
        FOR v_achievement IN SELECT id FROM achievements WHERE name = 'Running Riot' LOOP
            INSERT INTO player_achievements (user_id, achievement_id, game_id) VALUES (NEW.killer_id, v_achievement.id, NEW.game_id);
        END LOOP;
    END IF;
    IF v_streak_count = 20 THEN
        FOR v_achievement IN SELECT id FROM achievements WHERE name = 'Rampage' LOOP
            INSERT INTO player_achievements (user_id, achievement_id, game_id) VALUES (NEW.killer_id, v_achievement.id, NEW.game_id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_award_achievements AFTER INSERT ON game_events FOR EACH ROW EXECUTE FUNCTION fn_award_achievements();

CREATE OR REPLACE FUNCTION fn_user_created() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_lifetime_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_created AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION fn_user_created();

CREATE OR REPLACE FUNCTION fn_game_player_joined() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.team_id IS NOT NULL THEN
        INSERT INTO game_team_scores (game_id, team_id, score) VALUES (NEW.game_id, NEW.team_id, 0) ON CONFLICT (game_id, team_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_game_player_joined AFTER INSERT ON game_players FOR EACH ROW EXECUTE FUNCTION fn_game_player_joined();

-- =====================
-- VIEWS
-- =====================

CREATE OR REPLACE VIEW vw_player_leaderboard AS
SELECT u.id, u.gamertag, u.service_tag, pls.total_kills, pls.total_deaths,
    calculate_kd_ratio(pls.total_kills, pls.total_deaths) as kd_ratio, pls.total_games, pls.games_won,
    calculate_win_percentage(pls.games_won, pls.total_games) as win_percentage, pls.total_headshots, pls.highest_kill_streak,
    RANK() OVER (ORDER BY pls.total_kills DESC) as kills_rank,
    RANK() OVER (ORDER BY calculate_kd_ratio(pls.total_kills, pls.total_deaths) DESC) as kd_rank
FROM users u JOIN player_lifetime_stats pls ON u.id = pls.user_id ORDER BY pls.total_kills DESC;

CREATE OR REPLACE VIEW vw_recent_games AS
SELECT g.id, g.status, m.name as map_name, gt.name as game_type_name, t.name as winning_team_name, t.color as winning_team_color,
    g.started_at, g.ended_at, g.created_at, (SELECT COUNT(*) FROM game_players gp WHERE gp.game_id = g.id) as player_count
FROM games g JOIN maps m ON g.map_id = m.id JOIN game_types gt ON g.game_type_id = gt.id LEFT JOIN teams t ON g.winning_team_id = t.id
ORDER BY g.created_at DESC;

CREATE OR REPLACE VIEW vw_player_game_history AS
SELECT gp.user_id, u.gamertag, g.id as game_id, m.name as map_name, gt.name as game_type_name, t.name as team_name, t.color as team_color,
    pgs.kills, pgs.deaths, calculate_kd_ratio(pgs.kills, pgs.deaths) as kd_ratio, pgs.headshots,
    CASE WHEN gp.team_id = g.winning_team_id THEN true ELSE false END as won, g.ended_at as played_at
FROM game_players gp JOIN users u ON gp.user_id = u.id JOIN games g ON gp.game_id = g.id JOIN maps m ON g.map_id = m.id
JOIN game_types gt ON g.game_type_id = gt.id LEFT JOIN teams t ON gp.team_id = t.id
LEFT JOIN player_game_stats pgs ON pgs.game_id = g.id AND pgs.user_id = gp.user_id
WHERE g.status = 'completed' ORDER BY g.ended_at DESC;

CREATE OR REPLACE VIEW vw_weapon_stats AS
SELECT w.id, w.name, w.category, w.damage_type, COALESCE(SUM(pws.kills), 0) as total_kills,
    COALESCE(SUM(pws.headshots), 0) as total_headshots,
    calculate_accuracy(SUM(pws.shots_hit)::INTEGER, SUM(pws.shots_fired)::INTEGER) as avg_accuracy,
    COUNT(DISTINCT pws.user_id) as players_using
FROM weapons w LEFT JOIN player_weapon_stats pws ON w.id = pws.weapon_id
GROUP BY w.id, w.name, w.category, w.damage_type ORDER BY total_kills DESC;

CREATE OR REPLACE VIEW vw_map_stats AS
SELECT m.id, m.name, m.max_players, COUNT(g.id) as times_played,
    COUNT(g.id) FILTER (WHERE g.status = 'completed') as completed_games
FROM maps m LEFT JOIN games g ON m.id = g.map_id GROUP BY m.id, m.name, m.max_players ORDER BY times_played DESC;

CREATE OR REPLACE VIEW vw_achievement_progress AS
SELECT u.id as user_id, u.gamertag, a.id as achievement_id, a.name as achievement_name, a.description, a.type, a.icon_url,
    CASE WHEN pa.id IS NOT NULL THEN true ELSE false END as unlocked, pa.unlocked_at
FROM users u CROSS JOIN achievements a LEFT JOIN player_achievements pa ON pa.user_id = u.id AND pa.achievement_id = a.id
ORDER BY u.gamertag, a.name;

CREATE OR REPLACE VIEW vw_live_games AS
SELECT g.id, m.name as map_name, gt.name as game_type_name, gt.score_to_win, g.started_at,
    (SELECT COUNT(*) FROM game_players gp WHERE gp.game_id = g.id) as player_count,
    (SELECT json_agg(json_build_object('team_id', gts.team_id, 'team_name', t.name, 'team_color', t.color, 'score', gts.score))
     FROM game_team_scores gts JOIN teams t ON gts.team_id = t.id WHERE gts.game_id = g.id) as team_scores
FROM games g JOIN maps m ON g.map_id = m.id JOIN game_types gt ON g.game_type_id = gt.id WHERE g.status = 'in_progress';

CREATE OR REPLACE VIEW vw_player_profile AS
SELECT u.id, u.gamertag, u.service_tag, u.avatar_url, u.created_at as member_since, pls.total_kills, pls.total_deaths,
    calculate_kd_ratio(pls.total_kills, pls.total_deaths) as kd_ratio, pls.total_assists, pls.total_headshots,
    pls.total_games, pls.games_won, calculate_win_percentage(pls.games_won, pls.total_games) as win_percentage,
    pls.total_playtime_seconds, pls.highest_kill_streak,
    (SELECT COUNT(*) FROM player_achievements pa WHERE pa.user_id = u.id) as achievements_unlocked,
    (SELECT COUNT(*) FROM achievements) as total_achievements
FROM users u JOIN player_lifetime_stats pls ON u.id = pls.user_id;

CREATE OR REPLACE VIEW vw_kill_feed AS
SELECT ge.id, ge.game_id, ge.created_at, ku.gamertag as killer_gamertag, ku.id as killer_id, kt.name as killer_team_name, kt.color as killer_team_color,
    vu.gamertag as victim_gamertag, vu.id as victim_id, vt.name as victim_team_name, vt.color as victim_team_color, w.name as weapon_name,
    ge.is_headshot, ge.is_melee, ge.is_assassination, ge.is_grenade
FROM game_events ge JOIN users ku ON ge.killer_id = ku.id JOIN users vu ON ge.victim_id = vu.id JOIN weapons w ON ge.weapon_id = w.id
LEFT JOIN game_players kgp ON kgp.game_id = ge.game_id AND kgp.user_id = ge.killer_id
LEFT JOIN game_players vgp ON vgp.game_id = ge.game_id AND vgp.user_id = ge.victim_id
LEFT JOIN teams kt ON kgp.team_id = kt.id LEFT JOIN teams vt ON vgp.team_id = vt.id ORDER BY ge.created_at DESC;

CREATE OR REPLACE VIEW vw_player_weapon_breakdown AS
SELECT u.id as user_id, u.gamertag, w.id as weapon_id, w.name as weapon_name, w.category, pws.kills, pws.headshots, pws.shots_fired, pws.shots_hit,
    calculate_accuracy(pws.shots_hit, pws.shots_fired) as accuracy,
    ROUND(pws.kills::DECIMAL / NULLIF((SELECT SUM(kills) FROM player_weapon_stats WHERE user_id = u.id), 0) * 100, 2) as kill_percentage
FROM users u JOIN player_weapon_stats pws ON u.id = pws.user_id JOIN weapons w ON pws.weapon_id = w.id ORDER BY u.gamertag, pws.kills DESC;

-- =====================
-- SEED DATA
-- =====================

-- Teams
INSERT INTO teams (name, color) VALUES
    ('Red Team', '#DC2626'),
    ('Blue Team', '#2563EB'),
    ('Green Team', '#16A34A'),
    ('Orange Team', '#EA580C');

-- Maps
INSERT INTO maps (name, description, max_players) VALUES
    ('Valhalla', 'A large outdoor map with two bases connected by a valley.', 16),
    ('The Pit', 'A symmetrical training facility perfect for competitive play.', 10),
    ('Guardian', 'A mysterious Forerunner structure suspended in the jungle.', 8),
    ('Narrows', 'A bridge connecting two towering Forerunner structures.', 8),
    ('Last Resort', 'An abandoned beach resort with a massive wind turbine.', 14),
    ('High Ground', 'A fortified beachhead base with multiple entry points.', 12),
    ('Standoff', 'Two opposing military compounds in a dusty canyon.', 12),
    ('Construct', 'A towering Forerunner structure with multiple levels.', 8),
    ('Epitaph', 'An ancient arena surrounded by Forerunner architecture.', 8),
    ('Isolation', 'A mysterious underground Flood containment facility.', 10);

-- Game Types
INSERT INTO game_types (name, description, is_team_based, score_to_win) VALUES
    ('Team Slayer', 'Team deathmatch - first team to the score limit wins.', true, 50),
    ('Free For All', 'Every Spartan for themselves.', false, 25),
    ('Capture The Flag', 'Capture the enemy flag and return it to your base.', true, 3),
    ('Oddball', 'Hold the skull to score points.', true, 100),
    ('King of the Hill', 'Control the hill to score points.', true, 100);

-- Weapons
INSERT INTO weapons (name, description, category, damage_type) VALUES
    ('Battle Rifle', 'Three-round burst rifle, effective at medium range.', 'primary', 'kinetic'),
    ('Assault Rifle', 'Fully automatic rifle with large magazine.', 'primary', 'kinetic'),
    ('Covenant Carbine', 'Semi-automatic alien rifle.', 'primary', 'plasma'),
    ('SMG', 'Rapid-fire submachine gun.', 'primary', 'kinetic'),
    ('Magnum', 'Semi-automatic pistol.', 'secondary', 'kinetic'),
    ('Plasma Pistol', 'Covenant sidearm with charged shot capability.', 'secondary', 'plasma'),
    ('Mauler', 'Brute pistol with devastating close-range power.', 'secondary', 'kinetic'),
    ('Sniper Rifle', 'Long-range precision weapon.', 'power', 'kinetic'),
    ('Shotgun', 'Devastating close-range weapon.', 'power', 'kinetic'),
    ('Rocket Launcher', 'Twin-tube rocket launcher.', 'power', 'explosive'),
    ('Spartan Laser', 'Devastating directed-energy weapon.', 'power', 'plasma'),
    ('Energy Sword', 'Covenant melee weapon.', 'power', 'plasma'),
    ('Gravity Hammer', 'Brute melee weapon with area damage.', 'power', 'kinetic'),
    ('Beam Rifle', 'Covenant sniper rifle.', 'power', 'plasma'),
    ('Brute Shot', 'Grenade launcher with blade attachment.', 'power', 'explosive'),
    ('Needler', 'Fires tracking crystalline projectiles.', 'power', 'plasma'),
    ('Fuel Rod Gun', 'Covenant explosive weapon.', 'power', 'explosive'),
    ('Frag Grenade', 'Standard UNSC fragmentation grenade.', 'grenade', 'explosive'),
    ('Plasma Grenade', 'Sticky Covenant grenade.', 'grenade', 'plasma'),
    ('Spike Grenade', 'Brute spike grenade.', 'grenade', 'kinetic'),
    ('Incendiary Grenade', 'Firebomb grenade.', 'grenade', 'explosive');

-- Achievements
INSERT INTO achievements (name, description, type, requirement) VALUES
    ('Double Kill', 'Kill 2 enemies in quick succession.', 'medal', 2),
    ('Triple Kill', 'Kill 3 enemies in quick succession.', 'medal', 3),
    ('Overkill', 'Kill 4 enemies in quick succession.', 'medal', 4),
    ('Killtacular', 'Kill 5 enemies in quick succession.', 'medal', 5),
    ('Killtrocity', 'Kill 6 enemies in quick succession.', 'medal', 6),
    ('Killimanjaro', 'Kill 7 enemies in quick succession.', 'medal', 7),
    ('Killtastrophe', 'Kill 8 enemies in quick succession.', 'medal', 8),
    ('Killpocalypse', 'Kill 9 enemies in quick succession.', 'medal', 9),
    ('Killionaire', 'Kill 10 enemies in quick succession.', 'medal', 10),
    ('Killing Spree', 'Kill 5 enemies without dying.', 'medal', 5),
    ('Killing Frenzy', 'Kill 10 enemies without dying.', 'medal', 10),
    ('Running Riot', 'Kill 15 enemies without dying.', 'medal', 15),
    ('Rampage', 'Kill 20 enemies without dying.', 'medal', 20),
    ('Untouchable', 'Kill 25 enemies without dying.', 'medal', 25),
    ('Invincible', 'Kill 30 enemies without dying.', 'medal', 30),
    ('Headshot', 'Kill an enemy with a headshot.', 'medal', 1),
    ('Assassination', 'Kill an enemy from behind with melee.', 'medal', 1),
    ('Beat Down', 'Kill an enemy with melee from the front.', 'medal', 1),
    ('Stuck', 'Stick an enemy with a plasma grenade.', 'medal', 1),
    ('Splatter', 'Kill an enemy by running them over.', 'medal', 1),
    ('Sniper Kill', 'Kill an enemy with a sniper rifle.', 'medal', 1),
    ('Veteran', 'Complete 100 games.', 'career', 100),
    ('Spartan Officer', 'Reach 1000 total kills.', 'career', 1000),
    ('Marksman', 'Get 500 headshots.', 'career', 500),
    ('Warrior', 'Win 50 games.', 'career', 50),
    ('Perfectionist', 'Complete a game with 15+ kills and 0 deaths.', 'skill', 1),
    ('MVP', 'Be the top player in a game 10 times.', 'skill', 10);

-- Sample Users
INSERT INTO users (gamertag, email, service_tag) VALUES
    ('MasterChief117', 'chief@unsc.mil', 'S117'),
    ('CortanaAI', 'cortana@unsc.mil', 'CTN0'),
    ('SgtJohnson', 'johnson@unsc.mil', 'SRGJ'),
    ('ArbiterThel', 'arbiter@covenant.net', 'ARBY'),
    ('Noble6', 'b312@reach.mil', 'B312'),
    ('JorgeS052', 'jorge@reach.mil', 'S052'),
    ('EmileA239', 'emile@reach.mil', 'A239'),
    ('KatB320', 'kat@reach.mil', 'B320');
