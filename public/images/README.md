# Character Profile Images

Place the character profile images in this directory with the following filenames:

## Image Files Required

1. **redflag.png** - Tyler, the Walking Red Flag
   - Character ID: CHAR_PLACEHOLDER_REDFLAG (will be updated when actual ID is provided)
   - Description: Male character with blonde hair, aviator sunglasses, red shirt, gold chain

2. **jesus.png** - Jesus
   - Character ID: CHAR_7fc3c18a-cdfa-42f3-90f0-443cd013c5e0
   - Description: Jesus Christ with halo, beige/off-white robe, welcoming gesture

3. **bad-santa.png** - Bad Santa
   - Character ID: CHAR_d970937b-a512-4e23-9171-618e0db785b1
   - Description: Santa Claus with cigar, red suit with white trim, mischievous expression

4. **mafia-dad.png** - Mafia Dad
   - Character ID: CHAR_f0358157-1882-4856-b501-def240a44a06
   - Description: Man in black suit with gold chain, dark hair, mustache and goatee

## Image URLs

These images will be served at:
- `http://localhost:3000/images/redflag.png`
- `http://localhost:3000/images/jesus.png`
- `http://localhost:3000/images/bad-santa.png`
- `http://localhost:3000/images/mafia-dad.png`

The avatar URLs are configured in `src/config/characters.ts` and will be returned in the `/api/characters` endpoint response.

