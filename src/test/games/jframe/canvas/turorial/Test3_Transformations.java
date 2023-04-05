package test.games.jframe.canvas.turorial;

import test.games.jframe.canvas.AbstractCanvas;
import test.games.jframe.shapes.Shapes;

import javax.swing.*;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.geom.Rectangle2D;
public class Test3_Transformations extends AbstractCanvas {
    public Test3_Transformations(int w, int h, Color c) {
        super(w, h, c);
    }

    public Test3_Transformations(JFrame f) {
        super(1250, 750, Color.black);
    }

    @Override
    protected void paintComponent(Graphics g) {
        setup(g);
        paintBackground();
        //Shapes
        Rectangle2D.Double r1 = new Rectangle2D.Double(0,0,100,100);
        Rectangle2D.Double r2 = new Rectangle2D.Double(0,0,100,100);

        //Translate
        AffineTransform reset = g2d.getTransform(); //saves original

        g2d.translate(width/2, height/2);//(x=0, y=0) -> (x=Xmedio, y=Ymedio)
        g2d.setColor(Color.cyan);
        g2d.fill(r1);

        g2d.translate(-200, -100);//(x=0, y=0) -> (Xmedio-200, Ymedio-100)
        g2d.setColor(Color.pink);
        g2d.fill(r2);

        g2d.setTransform(reset); //reverts all translations after reset was created.
        g2d.setColor(Color.blue);
        g2d.fill(r1);

        //Rotate
        Rectangle2D.Double r = new Rectangle2D.Double(1000,500,100,100);
        g2d.setColor(Color.darkGray);
        g2d.fill(r);

        g2d.rotate(Math.toRadians(15),1000, 500); //(angle, Xpivot, Ypivot)
        g2d.setColor(Color.lightGray);
        g2d.fill(r);

        g2d.rotate(Math.toRadians(15),1000, 500);//(angle + 10, Xpivot, Ypivot)
        g2d.setColor(Color.orange);
        g2d.fill(r);

        g2d.setTransform(reset); //reset angle.

        g2d.rotate(Math.toRadians(45),1000, 500);//(angle, Xpivot, Ypivot)
        g2d.setColor(Color.yellow);
        g2d.fill(r);
    }
}
