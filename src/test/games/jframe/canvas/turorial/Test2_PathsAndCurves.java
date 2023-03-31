package test.games.jframe.canvas.turorial;

import test.games.jframe.canvas.AbstractCanvas;

import java.awt.*;
import java.awt.geom.Path2D;

public class Test2_PathsAndCurves extends AbstractCanvas {

    public Test2_PathsAndCurves(int w, int h, Color c) {
        super(w, h, c);
    }

    @Override
    protected void paintComponent(Graphics g) {
        setup(g);
        //paintBackground();

        //Path (drawing throw points)
        //moveTo: "levantar el lapiz hasta..."
        //lineTo: "dibujar hasta..."
        Path2D.Double path = new Path2D.Double();
        path.moveTo(100,300);
        path.lineTo(150, 200);
        path.lineTo(200,300);
        path.closePath();
        g2d.draw(path);
        //g2d.fill(p1)

        //Curve (with Bezier)
        //curveTo: (int brezierX1, brasierY1, brexierX2, brezierY2, pointX, pointY)
        Path2D.Double curve = new Path2D.Double();
        curve.moveTo(250,400);
        curve.curveTo(450,400,500,300,600, 400);
        g2d.draw(curve);

        Path2D.Double heart = new Path2D.Double ();
        heart.moveTo(328,256);
        heart.curveTo(329, 204, 397, 199,401,252);
        heart.curveTo(413, 201, 468, 198, 466,250);
        heart.curveTo(465,304,415, 345,402,350);
        heart.curveTo(388,346,328,308, 328,256);
        g2d. fill(heart);

    }
}
