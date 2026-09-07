export function Footer() {
  return (
    <footer id="footer">
      <hr />
      <div className="container">
        <div className="footer-built-with">
          built with:{" "}
          <a target="_blank" href="https://mohayonao.github.io/timbre.js/">
            timbre.js
          </a>
          ,{" "}
          <a target="_blank" href="https://d3js.org/">
            D3
          </a>
          ,{" "}
          <a target="_blank" href="https://react.dev/">
            React
          </a>
          ,{" "}
          <a target="_blank" href="https://tailwindcss.com/">
            Tailwind CSS
          </a>
          , and{" "}
          <a target="_blank" href="https://github.com/skratchdot/audio-sort/#built-with">
            others
          </a>
        </div>

        <div className="footer-copy">
          &copy; 2013{" "}
          <a className="footer-icon" href="http://skratchdot.com/">
            skratchdot <img alt="skratchdot" src={`${import.meta.env.BASE_URL}img/favicon.ico`} />
          </a>
        </div>
      </div>
    </footer>
  );
}
