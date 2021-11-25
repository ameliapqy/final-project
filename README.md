# Final Project!

### Design Doc

#### Introduction

- What motivates our project
  - Interest in real-time stylization in forms of
  - Chinese ink and wash painting
  - Allow users to generate Chinese painting with parameters that control the subject in the project

#### Goal

- What do we intend to achieve with this project
  - Create shaders that produce stylization effects that simulate Chinese ink and wash painting style
  - Allow users to control the appearances of the subjects in the painting, such as the height and range of the mountains, the iterations of the L-systems for the trees, and the number of boats in the river, size of the sun or moon, etc.

#### Inspiration/reference:

![](ref.jpeg)

- https://github.com/gracelgilbert/watercolor-stylization
- Volumetric : https://www.shadertoy.com/view/4sjfzw
- Hatching: https://www.shadertoy.com/view/MsSGD1
- Sketch drawing: https://www.shadertoy.com/view/ldXfRj
- https://www.shadertoy.com/view/ltyGRV
- https://www.shadertoy.com/view/lt2BRm
- Hatching & pointilism: https://www.cis.upenn.edu/~cis460/17fa/lectures/proceduralColor.pdf
- Video : https://artineering.io/publications/Art-Directed-Watercolor-Stylization-of-3D-Animations-in-Real-Time/

#### Specification:

- Outline the main features of your project.
  - Water color shader
  - adjustable parameters
  - animation element

#### Techniques:

- main technical/algorithmic tools we'll be using
  - WebGL to display the project
  - Glsl to write shaders
  - Scene:
    - Using instanced rendering to draw the geometries
    - Using lsystem to make the trees
    - Using shape grammar to make the mountains
    - Using noise function to make the fogs
- Ink wash effect:
  - create hand tremors: fluctuations can be simulated by minimally offsetting the vertices from their original positions
  - create pigment turbulence custom watercolor reflectance model extending common shading primitives. Then, pigment turbulence in the form of a low-frequency noise is applied to achieve water effect
  - create color bleeding Apply the gaussian kernel over the bled sections and blend the resulting low-pass image with the color image
  - create edge darkening Build upon the difference of Gaussian feature enhancement algorithms. After that, edges are modulated with smoothstep function to eliminate artifacts
  - reate paper distortion and granulation Directly sample the color values at UVs that have been shifted by the surface inclinations, available through the normal map of the paper texture

#### Design:

The entire project will be written in WebGL: ![](diagram.png)

#### Timeline:

- Week1 (11/15-11/22):

Amelia: Create project skeleton with instance rendering methods

Effie: Create basic scene

Effie: Code ink wash shader (edge and color bleeding)

Amelia: Code ink wash shader (blur and paper effect)

- Week2 (11/22-11/29): Add elements to the scene like trees, birds, and mountains (each take half of the scene)
- Week3 (11/29-12/6): Tune the scene and add parameters (each take half of the parameters)

## Milestone 2: Implementation part 1 (due 11/22)

Progress:

- set up basic scene and instance rendering
- begin writing shaders for the water color effect

Challenges:

- adding post process shaders are much harder than expected since a sampler2D is needed to passed into the machine.

## Milestone 3: Implementation part 2 (due 11/29)

We're over halfway there! This week should be about fixing bugs and extending the core of your generator. Make sure by the end of this week _your generator works and is feature complete._ Any core engine features that don't make it in this week should be cut! Don't worry if you haven't managed to exactly hit your goals. We're more interested in seeing proof of your development effort than knowing your planned everything perfectly.

Put all your code in your forked repository.

Submission: Add a new section to your README titled: Milestone #3, which should include

- written description of progress on your project goals. If you haven't hit all your goals, what did you have to cut and why?
- Detailed output from your generator, images, video, etc. We'll check your repository for updates. No need to create a new pull request.

Come to class on the due date with a WORKING COPY of your project. We'll be spending time in class critiquing and reviewing your work so far.

## Final submission (due 12/6)

Time to polish! Spen this last week of your project using your generator to produce beautiful output. Add textures, tune parameters, play with colors, play with camera animation. Take the feedback from class critques and use it to take your project to the next level.

Submission:

- Push all your code / files to your repository
- Come to class ready to present your finished project
- Update your README with two sections
  - final results with images and a live demo if possible
  - post mortem: how did your project go overall? Did you accomplish your goals? Did you have to pivot?

## Topic Suggestions

### Create a generator in Houdini

### A CLASSIC 4K DEMO

- In the spirit of the demo scene, create an animation that fits into a 4k executable that runs in real-time. Feel free to take inspiration from the many existing demos. Focus on efficiency and elegance in your implementation.
- Example:
  - [cdak by Quite & orange](https://www.youtube.com/watch?v=RCh3Q08HMfs&list=PLA5E2FF8E143DA58C)

### A RE-IMPLEMENTATION

- Take an academic paper or other pre-existing project and implement it, or a portion of it.
- Examples:
  - [2D Wavefunction Collapse Pokémon Town](https://gurtd.github.io/566-final-project/)
  - [3D Wavefunction Collapse Dungeon Generator](https://github.com/whaoran0718/3dDungeonGeneration)
  - [Reaction Diffusion](https://github.com/charlesliwang/Reaction-Diffusion)
  - [WebGL Erosion](https://github.com/LanLou123/Webgl-Erosion)
  - [Particle Waterfall](https://github.com/chloele33/particle-waterfall)
  - [Voxelized Bread](https://github.com/ChiantiYZY/566-final)

### A FORGERY

Taking inspiration from a particular natural phenomenon or distinctive set of visuals, implement a detailed, procedural recreation of that aesthetic. This includes modeling, texturing and object placement within your scene. Does not need to be real-time. Focus on detail and visual accuracy in your implementation.

- Examples:
  - [The Shrines](https://github.com/byumjin/The-Shrines)
  - [Watercolor Shader](https://github.com/gracelgilbert/watercolor-stylization)
  - [Sunset Beach](https://github.com/HanmingZhang/homework-final)
  - [Sky Whales](https://github.com/WanruZhao/CIS566FinalProject)
  - [Snail](https://www.shadertoy.com/view/ld3Gz2)
  - [Journey](https://www.shadertoy.com/view/ldlcRf)
  - [Big Hero 6 Wormhole](https://2.bp.blogspot.com/-R-6AN2cWjwg/VTyIzIQSQfI/AAAAAAAABLA/GC0yzzz4wHw/s1600/big-hero-6-disneyscreencaps.com-10092.jpg)

### A GAME LEVEL

- Like generations of game makers before us, create a game which generates an navigable environment (eg. a roguelike dungeon, platforms) and some sort of goal or conflict (eg. enemy agents to avoid or items to collect). Aim to create an experience that will challenge players and vary noticeably in different playthroughs, whether that means procedural dungeon generation, careful resource management or an interesting AI model. Focus on designing a system that is capable of generating complex challenges and goals.
- Examples:
  - [Rhythm-based Mario Platformer](https://github.com/sgalban/platformer-gen-2D)
  - [Pokémon Ice Puzzle Generator](https://github.com/jwang5675/Ice-Puzzle-Generator)
  - [Abstract Exploratory Game](https://github.com/MauKMu/procedural-final-project)
  - [Tiny Wings](https://github.com/irovira/TinyWings)
  - Spore
  - Dwarf Fortress
  - Minecraft
  - Rogue

### AN ANIMATED ENVIRONMENT / MUSIC VISUALIZER

- Create an environment full of interactive procedural animation. The goal of this project is to create an environment that feels responsive and alive. Whether or not animations are musically-driven, sound should be an important component. Focus on user interactions, motion design and experimental interfaces.
- Examples:
  - [The Darkside](https://github.com/morganherrmann/thedarkside)
  - [Music Visualizer](https://yuruwang.github.io/MusicVisualizer/)
  - [Abstract Mesh Animation](https://github.com/mgriley/cis566_finalproj)
  - [Panoramical](https://www.youtube.com/watch?v=gBTTMNFXHTk)
  - [Bound](https://www.youtube.com/watch?v=aE37l6RvF-c)

### YOUR OWN PROPOSAL

- You are of course welcome to propose your own topic . Regardless of what you choose, you and your team must research your topic and relevant techniques and come up with a detailed plan of execution. You will meet with some subset of the procedural staff before starting implementation for approval.
