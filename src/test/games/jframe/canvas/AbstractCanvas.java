package test.games.jframe.canvas;
import java.awt.*;
import java.awt.geom.*;
import javax.swing.*;

public abstract class AbstractCanvas extends JComponent{
    protected Graphics2D g2d;
    protected int width;
    protected int height;
    protected Color backgroundColor;

    protected AbstractCanvas(int w, int h, Color c) {
        width = w;
        height = h;
        backgroundColor = c;
    }
    protected void setup(Graphics g){
        setGraphics2D(g);
        antialiasing();
    }
    protected void setGraphics2D(Graphics g){
        g2d = (Graphics2D) g;
    }
    protected void antialiasing(){
        RenderingHints rh = new RenderingHints(
                RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON
        );
        g2d.setRenderingHints(rh);
    }
    protected void paintBackground(){
        Rectangle2D.Double background = new Rectangle2D.Double(0, 0, width, height);
        g2d.setColor(backgroundColor);
        g2d.fill(background);
    }

    protected abstract void paintComponent(Graphics g);

    @Override
    public int getWidth() {
        return width;
    }

    @Override
    public int getHeight() {
        return height;
    }
}
