import { buttonVariants } from "@/components/ui/button";
import { TextLink } from "@/components/text-link";
import { Link } from "@tanstack/react-router";

export function About() {
  return (
    <section className="mx-auto w-[calc(100%-2rem)] max-w-7xl" id="about">
      <div className="my-8 space-y-4 rounded-xl bg-neutral-100 p-6 text-center text-lg leading-relaxed lg:p-12">
        <h1 className="font-[Impact,Haettenschweiler,sans-serif] text-5xl uppercase">Audio Sort</h1>
        <p>This app was created as a way to "hear" what sorting algorithms sound like.</p>
        <p>
          To accomplish this, it uses a long list of{" "}
          <TextLink href="https://github.com/skratchdot/audio-sort/#built-with">libraries</TextLink>
          , and some of the more recent browser features like{" "}
          <TextLink href="http://www.html5rocks.com/en/tutorials/workers/basics/">
            Web Workers
          </TextLink>
          .
        </p>
        <p>
          I plan on adding a few more features, and getting a longer list of default sorting
          algoritms to choose from. You can currently tweak the existing algorithms, (or add your
          own) to hear what small changes sound like.
        </p>
        <p>
          If you have feature requests (or find a bug), please{" "}
          <TextLink href="https://github.com/skratchdot/audio-sort/issues">
            log an issue at Github
          </TextLink>
          . You can also leave{" "}
          <TextLink href="http://skratchdot.com/projects/audio-sort/">
            comments on the Project Page
          </TextLink>
        </p>
        <p>
          <Link className={buttonVariants({ size: "lg" })} to="/api">
            Algorithm API
          </Link>
          &nbsp;&nbsp;&nbsp;
          <Link
            className={buttonVariants({
              size: "lg",
              className: "bg-green-700 text-white hover:bg-green-800",
            })}
            to="/"
          >
            Start Sorting
          </Link>
        </p>
      </div>
    </section>
  );
}
