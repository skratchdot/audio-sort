import { Link } from "@tanstack/react-router";

export function About() {
  return (
    <section className="container" id="about">
      <div className="hero-unit">
        <h1>Audio Sort</h1>
        <p>This app was created as a way to "hear" what sorting algorithms sound like.</p>
        <p>
          To accomplish this, it uses a long list of{" "}
          <a href="https://github.com/skratchdot/audio-sort/#built-with">libraries</a>, and some of
          the more recent browser features like{" "}
          <a href="http://www.html5rocks.com/en/tutorials/workers/basics/">Web Workers</a>.
        </p>
        <p>
          I plan on adding a few more features, and getting a longer list of default sorting
          algoritms to choose from. You can currently tweak the existing algorithms, (or add your
          own) to hear what small changes sound like.
        </p>
        <p>
          If you have feature requests (or find a bug), please{" "}
          <a href="https://github.com/skratchdot/audio-sort/issues">log an issue at Github</a>. You
          can also leave{" "}
          <a href="http://skratchdot.com/projects/audio-sort/">comments on the Project Page</a>
        </p>
        <p>
          <Link className="button button-primary button-large" to="/api">
            Algorithm API
          </Link>
          &nbsp;&nbsp;&nbsp;
          <Link className="button button-success button-large" to="/">
            Start Sorting
          </Link>
        </p>
      </div>
    </section>
  );
}
