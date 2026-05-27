export default class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouseX = canvas.width / 2;
    
    // Key states
    this.keys = {
      ArrowLeft: false,
      ArrowRight: false,
      Space: false,
    };
    
    this.isClicked = false;

    // Bind event listeners
    window.addEventListener('keydown', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = false;
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
    });

    window.addEventListener('mousedown', () => {
      this.isClicked = true;
    });

    window.addEventListener('mouseup', () => {
      this.isClicked = false;
    });
  }
}
