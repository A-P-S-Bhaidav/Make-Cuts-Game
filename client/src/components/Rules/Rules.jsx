import { Link } from 'react-router-dom';
import './Rules.css';

/**
 * Interactive rules page with step-by-step explanations,
 * visual examples, and mini board demonstrations.
 */
export default function Rules() {
  return (
    <div className="rules-page page">
      <div className="bg-grid-pattern" aria-hidden="true"></div>

      <div className="rules-container">
        <header className="rules-header">
          <h1>How to <span className="text-gradient">Play</span></h1>
          <p>
            Make Cuts is a strategic two-player game based on paper-cutting logic.
            Master the rules below to outsmart your opponent.
          </p>
        </header>

        <section className="rules-section" aria-labelledby="rule-1-title">
          <span className="rules-section-number" aria-hidden="true">1</span>
          <h2 id="rule-1-title">Game Setup</h2>
          <p>
            The game is played on a rectangular grid of
            <span className="rules-highlight"> M x N </span>
            unit squares, representing a sheet of paper. Players choose the grid
            dimensions before starting.
          </p>
          <div className="rules-example">
            <div className="rules-example-title">Example</div>
            <p>
              A 4x4 grid contains 16 unit squares arranged in 4 rows and 4 columns.
              The internal grid lines between these squares are where cuts will be made.
            </p>
          </div>
        </section>

        <section className="rules-section" aria-labelledby="rule-2-title">
          <span className="rules-section-number" aria-hidden="true">2</span>
          <h2 id="rule-2-title">Taking Turns</h2>
          <p>
            Players alternate turns, starting with Player 1. On each turn, a player
            must make exactly <span className="rules-highlight">one cut</span> along
            an internal grid line, either horizontally or vertically.
          </p>
          <ul className="rules-list">
            <li>
              Cuts are made along the lines <span className="rules-highlight">between</span> cells,
              not along the outer border of the paper.
            </li>
            <li>
              Click on any internal edge on the game board to make your cut. The cut
              will extend across the entire region automatically.
            </li>
          </ul>
        </section>

        <section className="rules-section" aria-labelledby="rule-3-title">
          <span className="rules-section-number" aria-hidden="true">3</span>
          <h2 id="rule-3-title">Valid Cuts</h2>
          <p>
            Every cut <span className="rules-highlight">must divide</span> at least one
            previously connected region into two separate parts. This ensures the game
            always progresses.
          </p>
          <ul className="rules-list">
            <li>
              A cut extends along the full width or height of the region it passes through,
              splitting that region into two smaller pieces.
            </li>
            <li>
              Cuts that overlap with previous ones are permitted only if they result in
              further dividing a still-connected region.
            </li>
            <li>
              Valid edges glow <span style={{ color: 'var(--color-valid-edge)' }}>green</span> on
              hover. Invalid edges are dimmed and cannot be clicked.
            </li>
          </ul>
        </section>

        <section className="rules-section" aria-labelledby="rule-4-title">
          <span className="rules-section-number" aria-hidden="true">4</span>
          <h2 id="rule-4-title">Winning the Game</h2>
          <p>
            The game continues until the entire paper is divided into
            <span className="rules-highlight"> 1 x 1 blocks</span>. At that point,
            no more valid cuts can be made.
          </p>
          <p>
            The <span className="rules-highlight">last player to make a valid cut wins</span> the
            game. This follows the Normal Play Convention where the player who cannot move loses.
          </p>
          <div className="rules-example">
            <div className="rules-example-title">Strategy Tip</div>
            <p>
              The total number of moves in a game is always fixed at (total cells - 1).
              Think about parity: on a 4x4 grid (16 cells), there are exactly 15 moves.
              Player 1 gets moves 1, 3, 5, ..., 15 and makes the last cut, winning the game.
            </p>
          </div>
        </section>

        <section className="rules-section" aria-labelledby="rule-5-title">
          <span className="rules-section-number" aria-hidden="true">5</span>
          <h2 id="rule-5-title">Paper Stays Stationary</h2>
          <p>
            All cuts are permanent and the paper remains in place throughout the game.
            No pieces are moved or removed. The board visually tracks all regions with
            distinct colors so you can always see the current state.
          </p>
        </section>

        <section className="rules-section" aria-labelledby="rule-6-title">
          <span className="rules-section-number" aria-hidden="true">6</span>
          <h2 id="rule-6-title">Pre-Cut Configurations</h2>
          <p>
            Some games may begin with cuts already made on the paper. These pre-existing
            cuts create additional regions from the start, changing the game dynamics and
            the total number of remaining moves.
          </p>
        </section>

        <div className="rules-cta">
          <Link to="/play" className="btn btn-primary btn-lg" id="rules-play-btn">
            Start Playing
          </Link>
        </div>
      </div>
    </div>
  );
}
