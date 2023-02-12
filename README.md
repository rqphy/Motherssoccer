# Mother's Soccer

## The idea

I give myself 1 week to create a 3d video game! I want to test CANNON.js, a library that add physics to you ThreeJs project. I’ve already tested it with (this project) but I want to push it further this time. The 2022 World Cup is coming, so let’s pick Football as the main theme.

Because I’m not a good designer and 1 week is really shot, the design was made by a coworker at Wonderstudios.

[Live](https://lab.wonderstudios.com/#Mothers-Soccer)

## The gameplay

In the last weeks I’ve played Dunk Shot on my phone. It’s a basketball mobile game where you drag the ball and aim at the net. Now that I know how the player will be able to shoot the ball, I need to find a way to give him some points. Let’s spawn a target and make it move randomly every time it gets hit.

I want the players to compete versus each others, so I’ll add a time limit. They will be able to compare their score at the end of a game.

After some testing by my coworkers, it seems like the targets were too hard to hit. To make it more enjoyable for the casuals, I’ll make the target bigger. The thing is, I still want the game to be competitive, so I’ll accord more points if the player shoots the center of the target.

There is something that I want to test out. When I was younger, I played some Flash golf game on the web (yeah, the time flies haha.), and to make the shots harder they added wind (usually towards the end game). Anyway, I’ll add this after the player hit few targets.

## Some issues

### Raycaster

Once I’ve created the Mother’s Soccer world, It was time to add interactions. Let’s break out the shoot mechanic.

- The user puts his finger down when the cursor is on the ball
- The user moves his cursor to set the trajectory and the power
- The user puts his finger up to shoot

Ok, so the easier part is the last one, I just need to apply some force on the ball. The 2nd part will give me the parameters that I need to applyForce. The first mechanic seems easy though. Wait but how can I know when the user put his finger down on the ball? The two others mechanics can be handle by classic Javascript event listeners. I can’t add a MouseDown event on the ball because it’s not a DOM object.

I think about two solutions. The first one is a bit basic, I can just add an invisible div on top of the ball location in my DOM. It’s could work but I feel like it’s not a good idea. It will be harder to handle the responsive and… I kinda feel like I would be cheating. The other solutions would be to cast a raycaster on a MouseDown event and check if it intersects with the ball. It seems like a much cleaner solution but not a better one performance wise. I’ll go with the cleaner one and balance the performance somewhere else.

### The aim helper

As I mentioned before, one of the inspirations for the game play is Dunk Shot. In this game you have a small helper that shows where you’re aiming at. I really like this mechanic and I want to implement it.

If you play Mother’s Soccer, you can’t see any helper. It’s because I’ve failed. I got short on time and wasn’t able to implement this feature. To this day, I still have no idea how to create it, maybe I’ll come back to it in the future.

### The scoreboard

To keep competitive players entertained, I’ll add a scoreboard so they can compare their scores. If you want to know more about it, you can know the whole story on [this repo](https://github.com/rqphy/motherssoccer-score).

## Inspiration

[Dunk Shot](https://apps.apple.com/fr/app/dunk-shot/id1301375510)


## Install
> npm install

> npm run dev
