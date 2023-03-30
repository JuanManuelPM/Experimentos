package test.games.ChatGPT;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import javax.swing.JFrame;
import javax.swing.JPanel;

public class Arrow extends JPanel {
    private int mouseX, mouseY;
    private boolean isClicked;

    public Arrow() {
        addMouseListener(new MouseAdapter() {
            public void mouseClicked(MouseEvent e) {
                if (isClicked) {
                    isClicked = false;
                } else {
                    isClicked = true;
                }
                repaint();
            }
        });
        addMouseMotionListener(new MouseAdapter() {
            public void mouseMoved(MouseEvent e) {
                mouseX = e.getX();
                mouseY = e.getY();
                repaint();
            }
        });
    }

    public void paint(Graphics g) {
        Graphics2D g2d = (Graphics2D) g;

        int centerX = getWidth() / 2;
        int centerY = getHeight() / 2;

        g2d.setColor(Color.BLACK);
        g2d.drawLine(centerX, centerY, mouseX, mouseY);

        double dx = mouseX - centerX;
        double dy = mouseY - centerY;
        double angle = Math.atan2(dy, dx);

        int arrowLength = 20;
        int arrowWidth = 8;

        int x1 = (int) (mouseX - arrowLength * Math.cos(angle - Math.PI / 6));
        int y1 = (int) (mouseY - arrowLength * Math.sin(angle - Math.PI / 6));
        int x2 = mouseX;
        int y2 = mouseY;
        int x3 = (int) (mouseX - arrowLength * Math.cos(angle + Math.PI / 6));
        int y3 = (int) (mouseY - arrowLength * Math.sin(angle + Math.PI / 6));

        if (isClicked) {
            g2d.setColor(Color.RED);
        } else {
            g2d.setColor(Color.BLUE);
        }
        g2d.fillPolygon(new int[] { x1, x2, x3 }, new int[] { y1, y2, y3 }, 3);
    }

    public static void main(String[] args) {
        JFrame frame = new JFrame("Arrow");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.add(new Arrow());
        frame.setSize(900, 600);
        frame.setVisible(true);
    }
}
