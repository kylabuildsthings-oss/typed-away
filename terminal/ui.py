"""Typed Away UI — Coding Dojo terminal visuals (rich)."""

from __future__ import annotations

import sys
import termios
import tty
from typing import Optional

from rich.align import Align
from rich.console import Console, Group
from rich.panel import Panel
from rich.rule import Rule
from rich.table import Table
from rich.text import Text

console = Console()

# Dojo palette: soft pinks, dusty rose, warm cream, glowing magenta
MAGENTA = "#e83e8c"
PINK = "#f48fb1"
ROSE = "#c2185b"
CREAM = "#fff0f5"
WOOD = "#8d6e63"
INK = "#4a2c2a"
SCROLL = "#ffe4ec"
ACCENT = "#ff69b4"


def _scroll_panel(inner, title: str = "", subtitle: str = "") -> Panel:
    """Frame content like an unrolled scroll on the dojo floor."""
    return Panel(
        inner,
        title=f"[bold {MAGENTA}]{title}[/]" if title else None,
        subtitle=f"[{WOOD}]{subtitle}[/]" if subtitle else None,
        border_style=ROSE,
        padding=(1, 2),
        style=f"on {SCROLL}",
    )


def display_welcome() -> None:
    """Show dojo title screen with TYPED AWAY branding."""
    console.clear()

    banner = Text()
    banner.append("\n")
    banner.append("  ══════════════════════════════════════\n", style=f"bold {WOOD}")
    banner.append("         ✦  T Y P E D   A W A Y  ✦\n", style=f"bold {MAGENTA}")
    banner.append("           Type. Learn. Conquer.\n", style=f"italic {INK}")
    banner.append("  ══════════════════════════════════════\n", style=f"bold {WOOD}")
    banner.append("\n")
    banner.append("     ┌─ shoji ─┐   ⚔ katana rack\n", style=WOOD)
    banner.append("     │  dojo   │   盆栽  bonsai\n", style=WOOD)
    banner.append("     └─────────┘   📜  scroll ready\n", style=WOOD)
    banner.append("\n")
    banner.append("  Welcome, student. Train your katas.\n", style=INK)
    banner.append("  Spirit Energy: ❤️ ❤️ ❤️   |   Belts await.\n", style=PINK)
    banner.append("\n")
    banner.append("  Press ENTER to begin your training…  ✦\n", style=f"bold {ACCENT}")

    console.print(
        Align.center(
            _scroll_panel(
                Align.center(banner),
                title="⚔ CODING DOJO ⚔",
                subtitle="tatami · ink · discipline",
            )
        )
    )
    try:
        input()
    except EOFError:
        pass


def display_challenge(description: str, expected: str) -> None:
    """Show challenge on left scroll pane; typing area hint on the right."""
    console.clear()

    # Mockup: left = challenge prompt only (no solution spoiler)
    left = Text()
    left.append("Challenge:\n", style=f"bold {ROSE}")
    left.append(description + "\n", style=INK)
    _ = expected  # kept for API; revealed in Sensei's verdict after submit

    right = Text()
    right.append("YOUR SCROLL\n", style=f"bold {MAGENTA}")
    right.append("─" * 28 + "\n", style=WOOD)
    right.append("Type your solution here.\n", style=INK)
    right.append("Enter = new line\n", style=f"dim {WOOD}")
    right.append("Ctrl+D / Esc = submit\n\n", style=f"dim {WOOD}")
    right.append("█", style=f"bold {MAGENTA}")

    table = Table.grid(expand=True, padding=(0, 2))
    table.add_column(ratio=1)
    table.add_column(ratio=1)
    table.add_row(
        Panel(left, border_style=ROSE, style=f"on {SCROLL}", title="[bold]📜 Prompt[/]"),
        Panel(right, border_style=MAGENTA, style=f"on {CREAM}", title="[bold]✍ Code[/]"),
    )

    console.print(
        _scroll_panel(
            table,
            title="TYPED AWAY · Dojo Floor",
            subtitle="✦ focus your spirit ✦",
        )
    )
    console.print()


def get_typed_code() -> str:
    """
    Capture keystrokes in real time.
    Enter inserts a newline; Backspace deletes; Ctrl+D (or Esc) submits.
    Falls back to multiline stdin if not a TTY.
    """
    console.print(
        Text("  ▸ Typing…  (Ctrl+D or Esc when finished)", style=f"bold {ACCENT}")
    )
    console.print(Text("  ┌─ your code ─────────────────────────", style=WOOD))

    if not sys.stdin.isatty():
        lines: list[str] = []
        try:
            for line in sys.stdin:
                lines.append(line.rstrip("\n"))
        except EOFError:
            pass
        console.print(Text("  └─────────────────────────────────────", style=WOOD))
        return "\n".join(lines)

    fd = sys.stdin.fileno()
    old = termios.tcgetattr(fd)
    buf: list[str] = []
    current_line: list[str] = []

    def _flush_line_display() -> None:
        # Redraw current line after edits
        sys.stdout.write("\r\033[K")
        sys.stdout.write("  │ " + "".join(current_line) + "█")
        sys.stdout.flush()

    try:
        tty.setraw(fd)
        sys.stdout.write("  │ █")
        sys.stdout.flush()

        while True:
            ch = sys.stdin.read(1)
            if not ch:
                break

            code = ord(ch)

            # Ctrl+D or Esc → submit
            if code in (4, 27):
                break

            # Enter → newline
            if code in (10, 13):
                buf.append("".join(current_line))
                current_line = []
                sys.stdout.write("\r\n  │ █")
                sys.stdout.flush()
                continue

            # Backspace / Delete
            if code in (8, 127):
                if current_line:
                    current_line.pop()
                    _flush_line_display()
                elif buf:
                    # Pull previous line back
                    prev = buf.pop()
                    current_line = list(prev)
                    sys.stdout.write("\r\033[K\033[A\r\033[K")
                    _flush_line_display()
                continue

            # Ignore other control chars
            if code < 32:
                continue

            current_line.append(ch)
            _flush_line_display()
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old)
        sys.stdout.write("\r\n")
        sys.stdout.flush()

    if current_line:
        buf.append("".join(current_line))

    console.print(Text("  └─────────────────────────────────────", style=WOOD))
    return "\n".join(buf)


def display_feedback(is_correct: bool, expected: str, actual: str) -> None:
    """Show expected vs actual with Sensei's verdict."""
    verdict = (
        Text("✔  SENSEI'S VERDICT: KATA MASTERED!", style=f"bold green")
        if is_correct
        else Text("✘  SENSEI'S VERDICT: LOSS OF FOCUS", style=f"bold {ROSE}")
    )

    table = Table(expand=True, show_header=True, header_style=f"bold {MAGENTA}")
    table.add_column("Expected (Sensei)", style=INK, ratio=1)
    table.add_column("Your Scroll", style=INK, ratio=1)
    table.add_row(expected.strip() or "(empty)", actual.strip() or "(empty)")

    console.print()
    console.print(
        _scroll_panel(
            Group(Align.center(verdict), Rule(style=WOOD), table),
            title="⚔ Verdict",
            subtitle="learn · refine · try again",
        )
    )
    console.print()
    try:
        console.input(Text("  Press ENTER to continue… ✦ ", style=ACCENT))
    except EOFError:
        pass


def display_score(
    score: int, q_num: int, total: int, lives: int, time: float
) -> None:
    """Persistent dojo scoreboard header."""
    hearts = "❤️ " * max(0, lives) + ("🖤 " * max(0, 3 - lives) if lives < 3 else "")
    if lives <= 0:
        hearts = "🖤 🖤 🖤"

    board = Table.grid(expand=True)
    board.add_column(justify="left")
    board.add_column(justify="center")
    board.add_column(justify="right")
    board.add_row(
        Text(f"Score: {score}", style=f"bold {MAGENTA}"),
        Text(f"Kata {q_num}/{total}", style=INK),
        Text(f"Spirit {hearts.strip()}  ·  {time:.0f}s", style=PINK),
    )

    console.print(
        Panel(
            board,
            title=f"[bold {MAGENTA}]⚔ Dojo Scoreboard[/]",
            border_style=WOOD,
            style=f"on {CREAM}",
        )
    )


def display_level_up(level: int) -> None:
    """Belt promotion announcement."""
    names = {1: "White Belt", 2: "Yellow Belt", 3: "Green Belt"}
    colors = {1: "white", 2: "yellow", 3: "green"}
    name = names.get(level, f"Belt {level}")
    color = colors.get(level, MAGENTA)

    msg = Text()
    msg.append("\n  🥋  BELT PROMOTION!  🥋\n\n", style=f"bold {MAGENTA}")
    msg.append(f"  You've earned your {name}!\n", style=f"bold {color}")
    msg.append("  Train harder. Sharper code awaits.\n", style=INK)

    console.print(
        Align.center(
            _scroll_panel(Align.center(msg), title="✦ Advancement ✦", subtitle="rank up")
        )
    )
    try:
        console.input(Text("  Press ENTER to continue… ", style=ACCENT))
    except EOFError:
        pass


def display_game_over(score: int, time: float, accuracy: float) -> None:
    """Final results with dojo-themed ranking."""
    if accuracy >= 90:
        rank = "Master"
    elif accuracy >= 75:
        rank = "Black Belt Candidate"
    elif accuracy >= 60:
        rank = "Dedicated Student"
    elif accuracy >= 40:
        rank = "Apprentice"
    else:
        rank = "Grasshopper"

    body = Text()
    body.append("\n  ✦  TRAINING COMPLETE  ✦\n\n", style=f"bold {MAGENTA}")
    body.append(f"  Final Score:   {score}\n", style=INK)
    body.append(f"  Time:          {time:.1f}s\n", style=INK)
    body.append(f"  Accuracy:      {accuracy:.1f}%\n", style=INK)
    body.append(f"\n  Rank:          {rank}\n", style=f"bold {ACCENT}")
    body.append("\n  Return to the dojo whenever you are ready.\n", style=WOOD)
    body.append("  Type. Learn. Conquer.\n\n", style=f"italic {PINK}")

    console.clear()
    console.print(
        Align.center(
            _scroll_panel(
                Align.center(body),
                title="⚔ TYPED AWAY ⚔",
                subtitle="✦ the path never ends ✦",
            )
        )
    )


def prompt_hint(hint: Optional[str]) -> None:
    """Optional helper used by Game when showing a hint."""
    if not hint:
        return
    console.print(Text(f"  Hint: {hint}", style=f"dim italic {WOOD}"))
