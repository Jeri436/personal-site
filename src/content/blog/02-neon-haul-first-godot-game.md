---
title: 'Neon Haul: My First Godot Game'
date: 2026-03-02
description: "I made my first game. A cyberpunk arcade catcher built in Godot 4.3. Here is what I learned about nodes, GDScript, and why exponential lerp is now my favorite thing."
tags: ['Godot', 'Game Dev', 'GDScript', 'Mobile']
readTime: '6 min read'
---

## The First Game

I have been a web developer. Websites, components, scroll animations, that has been my world so far. I did spend time here and there poking around in game engines, loading up a template, following a tutorial for twenty minutes, then closing it and going back to whatever I was building. Never anything serious. Never anything finished.

The result is **Neon Haul**: a 2D arcade catcher for mobile. You control a Scrap Bot, a glowing cube on a floating platform, and your job is to catch falling energy crystals before they hit the ground. Three lives, a difficulty that creeps up on you, and a dash move to save the impossible catches. That is the whole game.

The idea itself is not original. Years ago I watched a YouTube tutorial where someone built a basic catcher game as a beginner exercise. Object falls from the top, you catch it, you score a point. I never finished that tutorial either. But the concept stuck somewhere in the back of my head.

What made me actually want to build it this time was Cyberpunk 2077. I had been playing a lot of it lately and the aesthetic got under my skin. The neon, the dark cities, the glow against concrete. Shoutout to CD Projekt Red for making something that genuinely inspiring to look at. I figured if I was going to make a small catcher game as a learning exercise, I might as well dress it up in something I was excited about. That framing is what pushed me to actually finish it.

It sounds simple because it is. That is intentional. My goal was to **finish something**, not to build something impressive. Finishing is harder than it sounds.

## Why Godot

I looked at Unity and Unreal. Unity's recent licensing drama left a bad taste, and Unreal felt like serious overkill for a 2D mobile arcade game. Godot is free, open source, and the community has grown enormously since version 4 launched.

Godot 4.3 with the mobile renderer was my pick. The engine is small, the editor boots fast, and the documentation is genuinely good. I had a player moving around the screen within the first afternoon.

## Nodes and Scenes: The Mental Shift

Coming from web development, I think in components. React, Astro, that kind of mental model. Godot's answer to that is **nodes and scenes**, and it clicked for me faster than I expected.

Every scene is a tree of nodes. A `CharacterBody2D` for the player, a `CollisionShape2D` inside it, a `Polygon2D` for the body, a `PointLight2D` for the glow. You nest them, you compose them. A completed scene becomes a reusable asset you can instantiate from code or drop into another scene.

The Scrap Bot lives in `scenes/player.tscn`. The energy crystals are `scenes/crystal.tscn`. The spawner creates new crystal instances at runtime and injects them into the main scene tree on a timer.

What surprised me most is how good Godot's **signal system** is. Signals are typed event emitters. When the player catches a crystal, the crystal emits a `caught` signal and deletes itself. The main script listens for that signal and increments the score. The crystal has no idea what the score is. Perfect separation of concerns, exactly the kind of pattern I appreciate from years of frontend work.

## GDScript

I expected to dislike GDScript. I wanted to use C# since it is the other option. But GDScript is Python flavored with optional strong typing, and it turned out to be a genuinely pleasant scripting language for this kind of project.

The static typing syntax is clean:

```gdscript
const MAX_SPEED := 800.0
var _is_dashing := false

func _physics_process(delta: float) -> void:
    ...
```

The `delta` parameter in `_physics_process` is how Godot hands you the frame time on every tick. Every physics calculation gets multiplied by `delta` to stay frame rate independent. That is standard game dev practice, not a Godot invention, but internalizing it was one of the first real conceptual shifts going from web to games. On the web, time mostly does not exist at that granularity.

## Movement That Actually Feels Good

This is where I spent the most time. Getting movement to *feel* right is a craft in itself.

My first attempt was `move_toward`. The player snapped to target speed immediately and stopped dead on release. It was responsive but robotic. It felt like dragging a desktop icon.

The solution was **exponential lerp**:

```gdscript
velocity.x = lerp(velocity.x, direction * MAX_SPEED, 1.0 - exp(-ACCEL_LERP * delta))
```

This gives you a smooth organic acceleration curve. The closer you are to target speed, the slower you accelerate. On release, a lower friction constant makes the bot slide a little before stopping. It gives the cube a sense of weight without ever feeling sluggish.

Then I added a **dash**. Double tapping the left or right half of the screen sends the cube flying at 2000 units per second for 0.15 seconds, with a 1.2 second cooldown. After the dash the velocity carries over into normal movement so the transition is seamless. That one tiny detail, carrying momentum out of a dash, was the difference between it feeling cheap and feeling satisfying.

## Glow Without a Shader

Web developers reach for `filter: blur()` or box shadows to fake light. In Godot I got real time glow for almost nothing.

The trick is using HDR color values above 1.0 on objects and enabling the **Glow** effect in `WorldEnvironment`. Any pixel that exceeds the HDR threshold blooms outward. Pair that with a `PointLight2D` using a radial `GradientTexture2D` and every crystal looks like it is lit from within.

The background is `Color(0.02, 0.02, 0.06)`, nearly black with a barely perceptible blue tint. Against that, the cyan and magenta crystals glow hard. The visual identity of the whole game came together in about an hour once I understood how the 2D HDR rendering pipeline worked.

## Mobile Touch Input

The game targets Android in portrait mode at 1080x1920. Touch input in Godot is handled through `InputEventScreenTouch` and `InputEventScreenDrag` events, which give you the touch index and position on every frame.

My solution: hold anywhere on the left half of the screen to move left, hold the right half to move right. Active touches are tracked in a dictionary keyed by touch index. Godot supports multi touch natively, so two fingers on the same side just sums correctly without any extra work.

Double tap detection is done manually by comparing timestamps. If two taps land on the same side within 280 milliseconds, it fires a dash. It works surprisingly well in practice. Playtesting caught zero false dashes.

## Difficulty That Does Not Announce Itself

I wanted the difficulty to creep up without a "Level 2!" banner interrupting the flow. Two formulas run silently in the background throughout every session:

```
spawn_interval = max(0.4, 2.0 - 0.03 * elapsed_time)
fall_speed     = 250 + elapsed_time * 3.0
```

At the start, crystals appear every two seconds and fall gently. After fifty seconds they are spawning nearly three times as fast and falling noticeably quicker. Players rarely feel the ramp until they are already deep into a run, which is exactly what I wanted. The difficulty is not a system you fight against consciously. It is the reason you eventually lose.

## What Is Still Missing

The roadmap has open items. Audio is the biggest one: no SFX, no music yet. The game is fully silent and it shows. A synthwave loop and a small set of pickup sounds would do a lot. Haptic feedback on crystal catch and on losing a life would make the mobile experience feel native rather than just ported.

Android export is packaged but the store submission is not done yet. That is next on the list.

## What I Took Away

Game development is a different discipline from web development, but the overlap is bigger than I expected. State management, event systems, scene composition: these concepts all map across. The main difference is that web development is mostly about layout and data flow, while game development layers in the physics loop, frame timing, and the constant question of how things *feel* to control.

That last part, the question of feel, is something web development rarely demands at this level. A button either works or it does not. A character's movement has a texture to it that you can only evaluate by playing it. Iterating on feel required a different instinct than anything I had built before, and developing that instinct was the most valuable thing Neon Haul taught me.

The game is small. It works. It runs on my phone. That is enough for a first project.

The next one will be bigger.
