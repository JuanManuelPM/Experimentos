package test.games.ChatGPT;

/*
Este código crea un lienzo (un JPanel) y lo agrega a un marco (un JFrame).
Luego, dibuja un rectángulo azul en el lienzo. Para mover el rectángulo,
el código implementa la interfaz KeyListener y escucha los eventos del teclado.
Cuando se detecta un evento del teclado, se ajusta la posición del rectángulo y
se llama al método repaint() en el lienzo para volver a dibujar el rectángulo en su nueva posición.

Este código es muy básico, pero es un buen punto de partida para comenzar a experimentar con
los conceptos que te mencioné anteriormente. Puedes modificar el código para dibujar diferentes
objetos de juego y agregar detección de colisiones, animaciones y otros elementos de juego más complejos.
 */

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;

import javax.swing.JFrame;
import javax.swing.JPanel;

public class BasicSquareGame implements KeyListener {

    private JFrame frame;
    private JPanel canvas;
    private int rectX = 100;
    private int rectY = 100;

    public BasicSquareGame() {
        frame = new JFrame("Basic Game");
        canvas = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                g.setColor(Color.BLUE);
                g.fillRect(rectX, rectY, 50, 50);
            }
        };
        canvas.setPreferredSize(new Dimension(500, 500));
        canvas.setBackground(Color.WHITE);
        canvas.setFocusable(true);
        canvas.requestFocus();
        canvas.addKeyListener(this);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.add(canvas);
        frame.pack();
        frame.setVisible(true);
    }

    public void keyPressed(KeyEvent e) {
        int key = e.getKeyCode();
        if (key == KeyEvent.VK_LEFT) {
            rectX -= 10;
        } else if (key == KeyEvent.VK_RIGHT) {
            rectX += 10;
        } else if (key == KeyEvent.VK_UP) {
            rectY -= 10;
        } else if (key == KeyEvent.VK_DOWN) {
            rectY += 10;
        }
        canvas.repaint();
    }

    public void keyReleased(KeyEvent e) {}

    public void keyTyped(KeyEvent e) {}

    public static void main(String[] args) {
        new BasicSquareGame();
    }
}
