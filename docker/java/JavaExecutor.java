import java.io.*;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JavaExecutor {
    private static class ExecutionState {
        @SuppressWarnings("unused")
        public int lineNumber;
        public Map<String, Object> variables;
        public List<String> output;
        @SuppressWarnings("unused")
        public String error;

        public ExecutionState() {
            this.variables = new HashMap<>();
            this.output = new ArrayList<>();
        }
    }

    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in, "UTF-8"));
        ObjectMapper mapper = new ObjectMapper();

        while (true) {
            String input = reader.readLine();
            if (input == null || input.equals("exit"))
                break;

            try {
                ExecutionState state = executeCode(input);
                String jsonOutput = mapper.writeValueAsString(state);
                System.out.println(jsonOutput);
                System.out.flush();
            } catch (Exception e) {
                ExecutionState errorState = new ExecutionState();
                errorState.error = e.getMessage();
                String errorJsonOutput = mapper.writeValueAsString(errorState);
                System.out.println(errorJsonOutput);
                System.out.flush();
            }
        }
    }

    private static ExecutionState executeCode(String code) {
        ExecutionState state = new ExecutionState();

        // Example: Add logic here to process `code`, update `state` accordingly
        // Currently, it just echoes the line number as a placeholder
        state.lineNumber = 1; // This would be updated based on actual code execution

        // Example of capturing a variable
        state.variables.put("exampleVariable", "exampleValue");

        // Add any messages or output to the output list
        state.output.add("Executed code: " + code);

        return state;
    }
}
