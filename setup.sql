\c charaoke

DROP TABLE IF EXISTS top_songs;

CREATE TABLE top_songs (
    id SERIAL PRIMARY KEY,
    lrclib_name TEXT,
    spotify_name TEXT,
    lrclib_id INT UNIQUE,
    artist TEXT,
    duration INT,
    lyrics TEXT,
    uri TEXT,
    num_plays INT
);

INSERT INTO top_songs (lrclib_name, spotify_name, lrclib_id, artist, duration, lyrics, uri, num_plays)
    VALUES ('The Beginning', 'The Beginning', 9972641, 'Marah in the Mainsail', 74,
            E'[00:00.25] There once lived a fox in the forest of old\n[00:06.41] Who donned a magnificent crown of bone\n[00:12.32] With eyes of jade and fur to match the flames\n[00:24.83] The all-seeing-owl foretold of his reign\n[00:30.95] Dreamt of the future again and again\n[00:36.83] Foretelling his story, the end of all ends\n[00:42.86] And the trees overheard what he said\n[00:49.01] The animals panicked in all different ways\n[00:55.09] The deer they froze and the birds they sang\n[01:00.66] A chorus of warning, of doom soon to come\n[01:06.29] How the great forest king would be slain\n[01:11.09] ',
            'spotify:track:4gIyG1uU29wUkjE4m0MMyP', 0);
DROP TABLE IF EXISTS song_9972641; 
CREATE TABLE song_9972641 (
    id SERIAL PRIMARY KEY,
    name TEXT,
    score INT
);

INSERT INTO top_songs (lrclib_name, spotify_name, lrclib_id, artist, duration, lyrics, uri, num_plays)
    VALUES ('Firework', 'Firework', 34132422, 'Katy Perry', 234, 
            E'[00:08.77] Do you ever feel like a plastic bag\n[00:12.68] Drifting through the wind, wanting to start again?\n[00:16.53] Do you ever feel, feel so paper-thin\n[00:20.34] Like a house of cards, one blow from caving in?\n[00:24.28] Do you ever feel already buried deep\n[00:27.96] Six feet under? Screams, but no one seems to hear a thing\n[00:31.92] Do you know that there''s still a chance for you?\n[00:35.67] ''Cause there''s a spark in you\n[00:37.72] You just gotta ignite the light\n[00:42.66] And let it shine\n[00:46.40] Just own the night\n[00:50.17] Like the Fourth of July\n[00:53.53] ''Cause baby, you''re a firework\n[00:57.66] Come on, show ''em what you''re worth\n[01:01.46] Make ''em go, "Aw! Aw! Aw!"\n[01:04.91] As you shoot across the sky\n[01:09.30] Baby, you''re a firework\n[01:13.03] Come on, let your colors burst\n[01:16.92] Make ''em go, "Aw! Aw! Aw!"\n[01:20.17] You''re gonna leave them all in awe, awe, awe\n[01:26.02] You don''t have to feel like a wasted space\n[01:30.03] You''re original, cannot be replaced\n[01:33.94] If you only knew what the future holds\n[01:37.53] After a hurricane comes a rainbow\n[01:41.39] Maybe a reason why all the doors are closed\n[01:45.29] So you could open one that leads you to the perfect road\n[01:49.29] Like a lightning bolt, your heart will glow\n[01:53.06] And when it''s time, you''ll know\n[01:55.16] You just gotta ignite the light\n[02:00.03] And let it shine\n[02:03.84] Just own the night\n[02:07.54] Like the Fourth of July\n[02:10.93] ''Cause baby, you''re a firework\n[02:15.07] Come on, show ''em what you''re worth\n[02:18.58] Make ''em go, "Aw! Aw! Aw!"\n[02:22.20] As you shoot across the sky\n[02:26.64] Baby, you''re a firework\n[02:30.41] Come on, let your colors burst\n[02:34.27] Make ''em go, "Aw! Aw! Aw!"\n[02:37.56] You''re gonna leave them all in awe, awe, awe\n[02:43.07] Boom, boom, boom\n[02:45.57] Even brighter than the moon, moon, moon\n[02:49.13] It''s always been inside of you, you, you\n[02:53.00] And now it''s time to let it through\n[02:57.33] ''Cause baby, you''re a firework\n[03:01.50] Come on, show ''em what you''re worth\n[03:05.22] Make ''em go, "Aw! Aw! Aw!"\n[03:08.63] As you shoot across the sky\n[03:13.04] Baby, you''re a firework\n[03:16.84] Come on, let your colors burst\n[03:20.71] Make ''em go, "Aw! Aw! Aw!"\n[03:24.06] You''re gonna leave them all in awe, awe, awe\n[03:31.48] Boom, boom, boom\n[03:31.96] Even brighter than the moon, moon, moon\n[03:37.29] Boom, boom, boom\n[03:39.67] Even brighter than the moon, moon, moon\n[03:42.86] ',
            'spotify:track:4lCv7b86sLynZbXhfScfm2', 0);
DROP TABLE IF EXISTS song_34132422; 
CREATE TABLE song_34132422 (
    id SERIAL PRIMARY KEY,
    name TEXT,
    score INT
);
\q

