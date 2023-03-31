package test.games.jframe;

import test.games.jframe.canvas.AbstractCanvas;
import test.games.jframe.canvas.turorial.Test3_Transformations;

import javax.swing.*;
import java.awt.*;

public class DrawingTester {
    public static void main(String[] args) {
        JFrame f = new JFrame();
        //___________Set Canvas_____________
        int w = 700;
        int h = 500;
        Color c = Color.darkGray;
        AbstractCanvas dc = new Test3_Transformations();
        //--------------Start---------------
        f.setSize(dc.getWidth(),dc.getHeight());
        f.setTitle("Drawing in Java");
        f.add(dc);
        f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        f.setVisible(true);
    }
}
