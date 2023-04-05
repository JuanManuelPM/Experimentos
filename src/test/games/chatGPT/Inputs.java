package test.games.chatGPT;

import javax.swing.*;
import java.awt.event.*;

public class Inputs {
    public Inputs(JFrame frame) {
        frame.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getButton() == MouseEvent.BUTTON1) {
                    System.out.println("Clic izquierdo en la posición: " + e.getX() + ", " + e.getY());
                } else if (e.getButton() == MouseEvent.BUTTON3) {
                    System.out.println("Clic derecho en la posición: " + e.getX() + ", " + e.getY());
                }
            }
        });

        frame.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                System.out.println("Tecla presionada: " + e.getKeyChar());
            }

            @Override
            public void keyReleased(KeyEvent e) {
                System.out.println("Tecla liberada: " + e.getKeyChar());
            }
        });
    }
    public static void main(String[] args) {
        JFrame frame = new JFrame("Mi juego");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(400, 400);
        frame.setVisible(true);

        Inputs inputs = new Inputs(frame);
    }
}
