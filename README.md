# Lumaform website

Live at https://lumaform-studio.netlify.app (Netlify project lumaform-studio). The portfolio site of Lumaform, seamless 4K motion loops made in code by Nabeel Ahmad.
Netlify publishes the `site/` folder from this repository on every push to `main`; there is no build step.

- `site/index.html`: the page.
- `site/assets/clips.js`: the clip list and the portfolio and contact links. To add a clip, add its line at the top of the list and put `site/media/al-NN.mp4` and `site/media/al-NN.jpg` beside the others.
- The contact form in `site/index.html` is a Netlify form named `contact` (form detection must be on in the Netlify project). Messages appear under Forms in the Netlify project.
- `site/media/`: watermarked 960x540 previews (12 s, H.264, no audio), their posters, and the showreel. They are made from the masters on the studio PC. The 4K masters never go in this repository.

Each push to `main` is one Netlify deploy, and the free plan counts deploys, so batch new clips into one push.
