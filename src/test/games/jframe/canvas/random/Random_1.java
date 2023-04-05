package test.games.jframe.canvas.random;

import test.games.jframe.canvas.AbstractCanvas;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
public class Random_1 extends AbstractCanvas {
    private int mouseX, mouseY, posX, posY;
    private boolean keyPressed = false;
    private char key;
    private Color color;
    public Random_1(){
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
                }
                repaint();
            }
        });
    }

    private void leftClick() {
        color = Color.black;
    }
    private void rigthClick() {
        color = new Color((int)(Math.random()*250),(int)(Math.random()*250),(int)(Math.random()*250));
    }

    @Override
    public void paint(Graphics g) {
        setup(g);
        paintBackground();
        //Shapes.fillArrowLine(g2d,centerX,centerY, mouseX, mouseY);
        int centerX = getWidth() / 2;
        int centerY = getHeight() / 2;

        g2d.setColor(color);
        g2d.drawLine(centerX, centerY, mouseX, mouseY);

        double dx = mouseX - centerX;
        double dy = mouseY - centerY;
        double angle = Math.atan2(dy, dx);

        int arrowLength = 20;
        int arrowWidth = 8;

        int x1 = (int) (mouseX - arrowLength * Math.cos(angle - Math.PI / arrowWidth));
        int y1 = (int) (mouseY - arrowLength * Math.sin(angle - Math.PI / arrowWidth));
        int x2 = mouseX;
        int y2 = mouseY;
        int x3 = (int) (mouseX - arrowLength * Math.cos(angle + Math.PI / arrowWidth));
        int y3 = (int) (mouseY - arrowLength * Math.sin(angle + Math.PI / arrowWidth));

        g2d.fillPolygon(new int[] { x1, x2, x3 }, new int[] { y1, y2, y3 }, 3);
    }

    public static void main(String[] args) {
        AbstractCanvas c = new Random_1();
    }
}
