package test.ui;

import java.io.IOException;
import java.util.Scanner;

public class ConsoleUI {
    private static Scanner scanner = new Scanner(System.in);

    public static void showMessage(String message) {
        System.out.println(message);
    }

    public static void showError(String message) {
        System.err.println("ERROR: " + message);
    }

    public static void showWarning(String message) {
        System.out.println("ADVERTENCIA: " + message);
    }

    public static boolean showQuestion(String message) {
        System.out.println(message + " (S/N)");
        String response = scanner.nextLine().trim().toUpperCase();
        return response.equals("S") || response.equals("SI");
    }

    public static String showOptions(String[] options) {
        System.out.println("Seleccione una opción:");
        for (int i = 0; i < options.length; i++) {
            System.out.println((i+1) + ") " + options[i]);
        }
        int selection = -1;
        while (selection < 1 || selection > options.length) {
            System.out.print("Ingrese el número de la opción: ");
            String response = scanner.nextLine().trim();
            try {
                selection = Integer.parseInt(response);
            } catch (NumberFormatException e) {
                System.err.println("ERROR: Ingrese un número válido.");
            }
        }
        return options[selection-1];
    }

    public static String showInputDialog(String prompt) {
        System.out.print(prompt + ": ");
        return scanner.nextLine().trim();
    }

    public static int showInputIntDialog(String prompt) {
        int value = 0;
        boolean valid = false;
        while (!valid) {
            try {
                System.out.print(prompt + ": ");
                value = Integer.parseInt(scanner.nextLine().trim());
                valid = true;
            } catch (NumberFormatException e) {
                System.err.println("ERROR: Ingrese un número válido.");
            }
        }
        return value;
    }

    public static double showInputDoubleDialog(String prompt) {
        double value = 0;
        boolean valid = false;
        while (!valid) {
            try {
                System.out.print(prompt + ": ");
                value = Double.parseDouble(scanner.nextLine().trim());
                valid = true;
            } catch (NumberFormatException e) {
                System.err.println("ERROR: Ingrese un número válido.");
            }
        }
        return value;
    }

    public static void clearConsole() {
        for (int i = 0; i < 50; i++) {
            System.out.println();
        }
    }

    public static void main(String[] args) {
        // Ejemplos de uso
        ConsoleUI.showMessage("¡Hola, mundo!");
        String input = ConsoleUI.showInputDialog("Ingrese un nombre");
        int number = ConsoleUI.showInputIntDialog("Ingrese un número entero");
        double decimal = ConsoleUI.showInputDoubleDialog("Ingrese un número decimal");
        String[] options = {"Opción 1", "Opción 2", "Opción 3"};
        String option = ConsoleUI.showOptions(options);
        boolean confirmed = ConsoleUI.showQuestion("¿Está seguro?");
        if (confirmed) {
            ConsoleUI.showMessage("El usuario seleccionó Sí.");
        } else {
            ConsoleUI.showMessage("El usuario seleccionó No.");
        }
        if (ConsoleUI.showQuestion("¿Desea limpiar la consola antes de terminar el programa?")) {
            ConsoleUI.clearConsole();
            ConsoleUI.showMessage("El usuario seleccionó Sí.");
        } else {
            ConsoleUI.showMessage("El usuario seleccionó No.");
        }
    }
}
