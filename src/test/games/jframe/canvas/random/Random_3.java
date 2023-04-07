package test.games.jframe.canvas.random;

import test.games.jframe.canvas.AbstractCanvas;
import test.games.jframe.shapes.Shapes;

import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

public class Random_3 extends AbstractCanvas {
    // a medida que moves el mouse una cierta distancia, se genera una flecha como si fuese una huella de tu direccion.
    //si las flechas son mas "largas/lejanas" pasar de color verde a uno mas rojo;
    // color rojo++ color verde-- segun la distancia
    private int mouseX, mouseY, posX, posY, xCounter, yCounter, red, green;
    private int lastDistance = 1;
    private char key;
    private Color color;
    private boolean clicked = false;
    public Random_3(){
        super();
        color = Color.black;
        red = 250;
        addMouseMotionListener(new MouseAdapter() {
            public void mouseMoved(MouseEvent e) {
                mouseX = e.getX();
                mouseY = e.getY();
                xCounter++;
                yCounter++;
                repaint();
            }
        });
        addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getButton() == MouseEvent.BUTTON1) {
                    leftClick();
                } else if (e.getButton() == MouseEvent.BUTTON3) {
                    rigthClick();
                }else{
                }
                repaint();
            }
        });
    }

    private void leftClick() {
        clicked = true;
        color = new Color((int)(Math.random()*250),(int)(Math.random()*250),(int)(Math.random()*250));

    }
    private void rigthClick() {
        color = new Color((int)(Math.random()*250),(int)(Math.random()*250),(int)(Math.random()*250));
    }

    @Override
    public void paint(Graphics g) {
        setup(g);
        //paintBackground();
        if (xCounter == 10 && yCounter == 10){
            final int Xdistance = mouseX - posX;
            final int Ydistance = mouseY - posY;
            int distance =10*(Xdistance + Ydistance)/2;
            if (distance<0) distance*=-1;
            int red = Math.max(0, Math.min(255, (int)((255 * (distance + 100) / (distance + 500)))));
            if (distance < 1){distance = 1;}
            color = new Color(red,250-red,0);
            lastDistance = distance;
            System.out.println(distance);
            g2d.setColor(color);
            Shapes.drawArrowLine(g2d,posX,posY,mouseX,mouseY);
            posX = mouseX;
            posY = mouseY;
            clicked = false;
            xCounter = 0;
            yCounter = 0;

        }
    }

    public static void main(String[] args) {
        AbstractCanvas c = new Random_3();
    }
}
