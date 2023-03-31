package test.games.chatGPT;

import java.awt.*;
import java.awt.event.*;
import java.util.*;
import javax.swing.*;
import java.util.Timer;


public class CrazyArrows extends JPanel implements ActionListener {
    private ArrayList<Arrow> arrows;
    private Timer timer;

    public CrazyArrows() {
        setBackground(Color.WHITE);
        arrows = new ArrayList<Arrow>();
        addMouseListener(new MouseAdapter() {
            public void mousePressed(MouseEvent e) {
                arrows.add(new Arrow(getWidth() / 2, getHeight() / 2, e.getX(), e.getY()));
                repaint();
            }
        });

        addMouseMotionListener(new MouseAdapter() {
            public void mouseMoved(MouseEvent e) {
                for (Arrow arrow : arrows) {
                    arrow.setTarget(e.getX(), e.getY());
                }
                repaint();
            }
        });
    }

    public void actionPerformed(ActionEvent e) {
        for (Arrow arrow : arrows) {
            arrow.changeDirection();
        }
        repaint();
    }

    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        for (Arrow arrow : arrows) {
            arrow.move();
            g2d.setColor(arrow.getColor());
            g2d.fillPolygon(arrow.getPolygon());
        }
    }

    public static void main(String[] args) {
        JFrame frame = new JFrame("Crazy Arrows");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.add(new CrazyArrows());
        frame.setSize(500, 300);
        frame.setVisible(true);
    }

    private class Arrow {
        private int x, y, dx, dy;
        private int size;
        private Polygon polygon;
        private Color color;

        public Arrow(int startX, int startY, int targetX, int targetY) {
            x = startX;
            y = startY;
            dx = targetX - startX;
            dy = targetY - startY;
            size = 20;
            setPolygon();
            setColor();
        }

        public void move() {
            x += dx / 50;
            y += dy / 50;
            setPolygon();
        }

        public void changeDirection() {
            int angle = (int) (Math.random() * 360);
            int distance = (int) (Math.random() * 50) + 50;
            dx = (int) (distance * Math.cos(Math.toRadians(angle)));
            dy = (int) (distance * Math.sin(Math.toRadians(angle)));
        }

        public void setTarget(int targetX, int targetY) {
            dx = targetX - x;
            dy = targetY - y;
        }

        public void setColor() {
            int red = (int) (Math.random() * 256);
            int green = (int) (Math.random() * 256);
            int blue = (int) (Math.random() * 256);
            color = new Color(red, green, blue);
        }

        public void setPolygon() {
            int[] xPoints = {x - size / 2, x + size / 2, x + size / 2, x + size, x + size / 2, x + size / 2, x - size / 2, x - size / 2};
            int[] yPoints = {y - size / 2, y - size / 2, y - size / 4, y, y + size / 4, y + size / 2, y + size / 2, y + size / 4};
            polygon = new Polygon(xPoints, yPoints, 8);
        }

        public Polygon getPolygon() {
            return polygon;
        }

        public Color getColor() {
            return color;
        }
    }
}