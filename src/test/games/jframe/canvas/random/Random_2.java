package test.games.jframe.canvas.random;

import test.games.jframe.canvas.AbstractCanvas;
import test.games.jframe.shapes.Shapes;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

public class Random_2 extends AbstractCanvas{
    private int mouseX, mouseY, posX, posY;
    private char key;
    private Color color;
    private boolean clicked = false;
    public Random_2(){
        super();
        color = Color.black;
        addMouseMotionListener(new MouseAdapter() {
            public void mouseMoved(MouseEvent e) {
                mouseX = e.getX();
                mouseY = e.getY();
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
        if (clicked){
            g2d.setColor(color);
            Shapes.drawArrowLine(g2d,posX,posY,mouseX,mouseY);
            posX = mouseX;
            posY = mouseY;
            clicked = false;
        }
    }

    public static void main(String[] args) {
        AbstractCanvas c = new Random_2();
    }

}
