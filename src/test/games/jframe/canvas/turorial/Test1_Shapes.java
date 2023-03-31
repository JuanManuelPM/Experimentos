package test.games.jframe.canvas.turorial;

import test.games.jframe.canvas.AbstractCanvas;
import test.games.jframe.shapes.Shapes;

import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.geom.Line2D;
import java.awt.geom.Rectangle2D;

public class Test1_Shapes extends AbstractCanvas {

    private Cloud c1;
    private Cloud c2;
    private Cloud c3;
    public Test1_Shapes(int w, int h, Color c) {
        super(w,h,c);
        c1 = new Cloud(10,350, 50, new Color(100,149,237));
        c2 = new Cloud(150,300, 75, new Color(200,50,100));
        c3 = new Cloud(325,100, 120, new Color(50,100,80));
    }
    public Test1_Shapes() {
        super();
        c1 = new Cloud(10,350, 50, new Color(100,149,237));
        c2 = new Cloud(150,300, 75, new Color(200,50,100));
        c3 = new Cloud(325,100, 120, new Color(50,100,80));
    }

    @Override
    protected void paintComponent(Graphics g) {
        setup(g);
        paintBackground();
        //main loop____________________________

        //Basic shapes
        //rectangle
        Rectangle2D.Double r = new Rectangle2D.Double(50, 55, 100, 150);
        g2d.setColor(Color.lightGray);
        g2d.fill(r);

        //ellipse
        Ellipse2D.Double e = new Ellipse2D.Double(200, 75, 100, 100);
        g2d.setColor(Color.pink);
        g2d.fill(e);

        //line
        Line2D.Double line = new Line2D.Double(width-250, height-100, 200, 50);
        g2d.setColor(Color.cyan);
        g2d.draw(line);

        //"cloud"
        c1.drawCloud(g2d);
        c2.drawCloud(g2d);
        c3.drawCloud(g2d);

        //paints
        g.drawLine(0,0,100,300);
        Shapes.drawArrowLine(g,0,0,400,300);
        //g2d.translate(400, 300);
        Shapes.drawArrow(g,0,0,100, 300);
    }
}
