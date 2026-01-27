import { db } from '../src/db';
import { teams, maps, gameTypes, weapons, achievements, users } from '../src/db/schema';

async function seed() {
  console.log('Seeding database...');

  // Seed Teams
  console.log('Seeding teams...');
  await db.insert(teams).values([
    { name: 'Red Team', color: '#DC2626' },
    { name: 'Blue Team', color: '#2563EB' },
    { name: 'Green Team', color: '#16A34A' },
    { name: 'Orange Team', color: '#EA580C' },
  ]).onConflictDoNothing();

  // Seed Maps
  console.log('Seeding maps...');
  await db.insert(maps).values([
    { name: 'Valhalla', description: 'A large outdoor map with two bases connected by a valley.', maxPlayers: 16 },
    { name: 'The Pit', description: 'A symmetrical training facility perfect for competitive play.', maxPlayers: 10 },
    { name: 'Guardian', description: 'A mysterious Forerunner structure suspended in the jungle.', maxPlayers: 8 },
    { name: 'Narrows', description: 'A bridge connecting two towering Forerunner structures.', maxPlayers: 8 },
    { name: 'Last Resort', description: 'An abandoned beach resort with a massive wind turbine.', maxPlayers: 14 },
    { name: 'High Ground', description: 'A fortified beachhead base with multiple entry points.', maxPlayers: 12 },
    { name: 'Standoff', description: 'Two opposing military compounds in a dusty canyon.', maxPlayers: 12 },
    { name: 'Construct', description: 'A towering Forerunner structure with multiple levels.', maxPlayers: 8 },
    { name: 'Epitaph', description: 'An ancient arena surrounded by Forerunner architecture.', maxPlayers: 8 },
    { name: 'Isolation', description: 'A mysterious underground Flood containment facility.', maxPlayers: 10 },
  ]).onConflictDoNothing();

  // Seed Game Types
  console.log('Seeding game types...');
  await db.insert(gameTypes).values([
    { name: 'Team Slayer', description: 'Team deathmatch - first team to the score limit wins.', isTeamBased: true, scoreToWin: 50 },
    { name: 'Free For All', description: 'Every Spartan for themselves.', isTeamBased: false, scoreToWin: 25 },
    { name: 'Capture The Flag', description: 'Capture the enemy flag and return it to your base.', isTeamBased: true, scoreToWin: 3 },
    { name: 'Oddball', description: 'Hold the skull to score points.', isTeamBased: true, scoreToWin: 100 },
    { name: 'King of the Hill', description: 'Control the hill to score points.', isTeamBased: true, scoreToWin: 100 },
  ]).onConflictDoNothing();

  // Seed Weapons
  console.log('Seeding weapons...');
  await db.insert(weapons).values([
    // Primary Weapons
    { name: 'Battle Rifle', description: 'Three-round burst rifle, effective at medium range.', category: 'primary', damageType: 'kinetic' },
    { name: 'Assault Rifle', description: 'Fully automatic rifle with large magazine.', category: 'primary', damageType: 'kinetic' },
    { name: 'Covenant Carbine', description: 'Semi-automatic alien rifle.', category: 'primary', damageType: 'plasma' },
    { name: 'SMG', description: 'Rapid-fire submachine gun.', category: 'primary', damageType: 'kinetic' },

    // Secondary Weapons
    { name: 'Magnum', description: 'Semi-automatic pistol.', category: 'secondary', damageType: 'kinetic' },
    { name: 'Plasma Pistol', description: 'Covenant sidearm with charged shot capability.', category: 'secondary', damageType: 'plasma' },
    { name: 'Mauler', description: 'Brute pistol with devastating close-range power.', category: 'secondary', damageType: 'kinetic' },

    // Power Weapons
    { name: 'Sniper Rifle', description: 'Long-range precision weapon.', category: 'power', damageType: 'kinetic' },
    { name: 'Shotgun', description: 'Devastating close-range weapon.', category: 'power', damageType: 'kinetic' },
    { name: 'Rocket Launcher', description: 'Twin-tube rocket launcher.', category: 'power', damageType: 'explosive' },
    { name: 'Spartan Laser', description: 'Devastating directed-energy weapon.', category: 'power', damageType: 'plasma' },
    { name: 'Energy Sword', description: 'Covenant melee weapon.', category: 'power', damageType: 'plasma' },
    { name: 'Gravity Hammer', description: 'Brute melee weapon with area damage.', category: 'power', damageType: 'kinetic' },
    { name: 'Beam Rifle', description: 'Covenant sniper rifle.', category: 'power', damageType: 'plasma' },
    { name: 'Brute Shot', description: 'Grenade launcher with blade attachment.', category: 'power', damageType: 'explosive' },
    { name: 'Needler', description: 'Fires tracking crystalline projectiles.', category: 'power', damageType: 'plasma' },
    { name: 'Fuel Rod Gun', description: 'Covenant explosive weapon.', category: 'power', damageType: 'explosive' },

    // Grenades
    { name: 'Frag Grenade', description: 'Standard UNSC fragmentation grenade.', category: 'grenade', damageType: 'explosive' },
    { name: 'Plasma Grenade', description: 'Sticky Covenant grenade.', category: 'grenade', damageType: 'plasma' },
    { name: 'Spike Grenade', description: 'Brute spike grenade.', category: 'grenade', damageType: 'kinetic' },
    { name: 'Incendiary Grenade', description: 'Firebomb grenade.', category: 'grenade', damageType: 'explosive' },
  ]).onConflictDoNothing();

  // Seed Achievements
  console.log('Seeding achievements...');
  await db.insert(achievements).values([
    // Multi-kill Medals
    { name: 'Double Kill', description: 'Kill 2 enemies in quick succession.', type: 'medal', requirement: 2 },
    { name: 'Triple Kill', description: 'Kill 3 enemies in quick succession.', type: 'medal', requirement: 3 },
    { name: 'Overkill', description: 'Kill 4 enemies in quick succession.', type: 'medal', requirement: 4 },
    { name: 'Killtacular', description: 'Kill 5 enemies in quick succession.', type: 'medal', requirement: 5 },
    { name: 'Killtrocity', description: 'Kill 6 enemies in quick succession.', type: 'medal', requirement: 6 },
    { name: 'Killimanjaro', description: 'Kill 7 enemies in quick succession.', type: 'medal', requirement: 7 },
    { name: 'Killtastrophe', description: 'Kill 8 enemies in quick succession.', type: 'medal', requirement: 8 },
    { name: 'Killpocalypse', description: 'Kill 9 enemies in quick succession.', type: 'medal', requirement: 9 },
    { name: 'Killionaire', description: 'Kill 10 enemies in quick succession.', type: 'medal', requirement: 10 },

    // Spree Medals
    { name: 'Killing Spree', description: 'Kill 5 enemies without dying.', type: 'medal', requirement: 5 },
    { name: 'Killing Frenzy', description: 'Kill 10 enemies without dying.', type: 'medal', requirement: 10 },
    { name: 'Running Riot', description: 'Kill 15 enemies without dying.', type: 'medal', requirement: 15 },
    { name: 'Rampage', description: 'Kill 20 enemies without dying.', type: 'medal', requirement: 20 },
    { name: 'Untouchable', description: 'Kill 25 enemies without dying.', type: 'medal', requirement: 25 },
    { name: 'Invincible', description: 'Kill 30 enemies without dying.', type: 'medal', requirement: 30 },

    // Style Medals
    { name: 'Headshot', description: 'Kill an enemy with a headshot.', type: 'medal', requirement: 1 },
    { name: 'Assassination', description: 'Kill an enemy from behind with melee.', type: 'medal', requirement: 1 },
    { name: 'Beat Down', description: 'Kill an enemy with melee from the front.', type: 'medal', requirement: 1 },
    { name: 'Stuck', description: 'Stick an enemy with a plasma grenade.', type: 'medal', requirement: 1 },
    { name: 'Splatter', description: 'Kill an enemy by running them over.', type: 'medal', requirement: 1 },
    { name: 'Sniper Kill', description: 'Kill an enemy with a sniper rifle.', type: 'medal', requirement: 1 },

    // Career Achievements
    { name: 'Veteran', description: 'Complete 100 games.', type: 'career', requirement: 100 },
    { name: 'Spartan Officer', description: 'Reach 1000 total kills.', type: 'career', requirement: 1000 },
    { name: 'Marksman', description: 'Get 500 headshots.', type: 'career', requirement: 500 },
    { name: 'Warrior', description: 'Win 50 games.', type: 'career', requirement: 50 },

    // Skill Achievements
    { name: 'Perfectionist', description: 'Complete a game with 15+ kills and 0 deaths.', type: 'skill', requirement: 1 },
    { name: 'MVP', description: 'Be the top player in a game 10 times.', type: 'skill', requirement: 10 },
  ]).onConflictDoNothing();

  // Seed Sample Users
  console.log('Seeding sample users...');
  await db.insert(users).values([
    { gamertag: 'MasterChief117', email: 'chief@unsc.mil', serviceTag: 'S117' },
    { gamertag: 'CortanaAI', email: 'cortana@unsc.mil', serviceTag: 'CTN0' },
    { gamertag: 'SgtJohnson', email: 'johnson@unsc.mil', serviceTag: 'SRGJ' },
    { gamertag: 'ArbiterThel', email: 'arbiter@covenant.net', serviceTag: 'ARBY' },
    { gamertag: 'Noble6', email: 'b312@reach.mil', serviceTag: 'B312' },
    { gamertag: 'JorgeS052', email: 'jorge@reach.mil', serviceTag: 'S052' },
    { gamertag: 'EmileA239', email: 'emile@reach.mil', serviceTag: 'A239' },
    { gamertag: 'KatB320', email: 'kat@reach.mil', serviceTag: 'B320' },
  ]).onConflictDoNothing();

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
