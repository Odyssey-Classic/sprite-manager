https://pixijs.com/assets/spritesheet/mc.json

Basic required JSON
```json
{
  "frames": {
    "Explosion_Sequence_A 1.png": {
      "frame": { "x": 244, "y": 1454, "w": 240, "h": 240 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 240, "h": 240 },
      "sourceSize": { "w": 240, "h": 240 }
    },
  },
  "meta": {

  },
}
```

Extension to Spritesheet for Editor organization.  
Should we include editor organization in the spritesheet JSON, or make it separate?  
We can use the unique hashes to track across multiple data entries.
```
{
  "frames": {
    "12345acdefb234...": {
      ...,
    }
  },
}
```

Groups: each key is a unique group name.  
<group>: `row`, `col` for where the sprite shows up in the editor.

Editor groups Sprites for easier access.  
This would allow Sprites to exist in multiple Groups.
