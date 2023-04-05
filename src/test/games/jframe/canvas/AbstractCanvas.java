package test.games.jframe.canvas;
import java.awt.*;
import java.awt.geom.*;
import javax.swing.*;

public abstract class AbstractCanvas extends JPanel {
    protected JFrame f;
    protected Graphics2D g2d;
    protected Color backgroundColor;
    protected final int width, height, centerX, centerY;
    protected boolean keyPressed = false;

    protected AbstractCanvas(int w, int h, Color c) {
        this.f = new JFrame();
        width = w;
        height = h;
        centerX = getWidth() / 2;
        centerY = getHeight() / 2;
        backgroundColor = c;
        run();
    }

    protected AbstractCanvas() {
        this.f = new JFrame();
        width = 1200;
        height = 800;
        centerX = getWidth() / 2;
        centerY = getHeight() / 2;
        backgroundColor = Color.lightGray;
        run();
    }

    protected void setup(Graphics g) {
        setGraphics2D(g);
        antialiasing();
    }

    protected void setGraphics2D(Graphics g) {
        g2d = (Graphics2D) g;
    }

    protected void antialiasing() {
        RenderingHints rh = new RenderingHints(
                RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON
        );
        g2d.setRenderingHints(rh);
    }

    protected void paintBackground() {
        Rectangle2D.Double background = new Rectangle2D.Double(0, 0, width, height);
        g2d.setColor(backgroundColor);
        g2d.fill(background);
    }

    @Override
    public int getWidth() {
        return width;
    }

    @Override
    public int getHeight() {
        return height;
    }

    public void run(){
        //___________Set Canvas_____________
        f.setTitle("Drawing in Java");
        f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        f.add(this);
        f.setSize(this.getWidth(),this.getHeight());
        f.setVisible(true);
    }
}