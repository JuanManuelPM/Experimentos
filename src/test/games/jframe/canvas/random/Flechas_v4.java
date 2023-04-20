package test.games.jframe.canvas.random;

import test.games.jframe.canvas.AbstractCanvas;
import test.games.jframe.shapes.Shapes;

import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

public class Flechas_v4 extends AbstractCanvas {
    // a medida que moves el mouse una cierta distancia, se genera una flecha como si fuese una huella de tu direccion.
    //si las flechas son mas "largas/lejanas" pasar de color verde a uno mas rojo;
    // color rojo++ color verde-- segun la distancia
    private int mouseX;
    private int mouseY;
    private double posX = (double) width /2;
    private double posY = (double) height /2;
    private int counter;
    private int red, green;
    private char key;
    private Color color;
    private boolean clicked = false;
    public Flechas_v4(){
        super();
        color = Color.black;
        red = 250;
        addMouseMotionListener(new MouseAdapter() {
            public void mouseMoved(MouseEvent e) {
                //mouseX = e.getX();
                //mouseY = e.getY();
                //xCounter++;
                //yCounter++;
                //repaint();
            }
        });
        addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getButton() == MouseEvent.BUTTON1) {
                    leftClick();
                } else if (e.getButton() == MouseEvent.BUTTON3) {
                    rigthClick();
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
        counter++;
        double newPosX = posX + (Math.random() * 2) - 1;
        double newPosY = posY + (Math.random() * 2) - 1;

        int distance = (int) (10*((posX-newPosX) + (posY-newPosY))/2);
        if (distance<0) distance *= -1;

        if (distance > 10){
            g2d.setColor(color);
            Shapes.drawArrowLine(g2d, (int) posX, (int) posY, (int) newPosX, (int) newPosY);
            posX = newPosX;
            posY = newPosY;
            counter = 0;
        }
    }

    public static void main(String[] args) {
        AbstractCanvas c = new Flechas_v4();
    }
}
