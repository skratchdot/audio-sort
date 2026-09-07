import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header id="header">
      <div className="container">
        <div className="row">
          <div id="header-title" className="span6">
            <h1>
              <Link to="/" className="home-link">
                Audio Sort
              </Link>{" "}
              <small>
                <a id="header-author" href="http://skratchdot.com/">
                  <span>by skratchdot</span>
                  <sub>✪</sub>
                </a>
              </small>
            </h1>
          </div>
          <div id="header-nav" className="span6">
            <ul className="breadcrumb">
              <li>
                <Link to="/">Home</Link> <span className="divider">/</span>
              </li>
              <li>
                <Link to="/about">About</Link> <span className="divider">/</span>
              </li>
              <li>
                <Link to="/api">API</Link> <span className="divider">/</span>
              </li>
              <li>
                <a href="https://github.com/skratchdot/audio-sort/" target="_blank">
                  Source
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
