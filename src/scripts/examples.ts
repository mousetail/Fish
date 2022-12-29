export interface ExampleProgram {
    name: string,
    code: string
    explanation?: string
}

export let examples: ExampleProgram[] = [
    {
        name: "Hello, World",
        code: "\"hello, world\"r\\\n          o;!?l<",
        explanation: `<h3>Hello World</h3><code>\"Hello World\"</code><br>
        Push the string \"dloroW olleH\" to the stack.<br>
        <code>\</code><br>Change the cursor direction do down.<br>
        <code>&gt</code>Change the cusor direciton to left<br>
        <code>l?!;</code><br>
        If the stack has at least one item, skip skipping halting <code>!;</code>. Effiectivly this halts if the stack is empty.<br>
        <code>o</code>Output the character at the top of the stack.
        `
    },
    {
        name: "FizzBuzz",
        code: "0voa                            ~/?=0:\\\n voa            oooo'Buzz'~<     /\n >1+:aa*1+=?;::5%:{3%:@*?\\?/'zziF'oooo/\n ^oa                 n:~~/\n",
        explanation: `
        <h3>FizzBuzz</h3>
        <p>This program implements the famous problem "FizzBuzz". For every
        number 1-100, print the number. Except if it's divisible by 3, when
        we replace it by "Fizz" or 5, in which case we replace the number by "Buzz".
        If it is divisible by both, we print "FizzBuzz".</p>

        <code>0v</code><br>
        Push 0 to the stack, then set the cusor direction to down.<br>
        <code>&gt;</code><br>
        Set the cursor direction to right.<br>
        <code>1+</code><br>
        Increment the current counter.
        <code>:aa*+=?</code><br>
        If the counter equals 100, exit. <code>a</code> is 10 so <code>aa*</code> is 100, and <code>aa*1+</code> is 101.<br>
        <code>::</code><br>
        Copy the counter twice.<br>
        <code>5%:</code><br>
        Push the value modulo 5 to the stack twice. Note the modulo is 0 if the counter
        was divisible by 5.<br>
        <code>{</code><br>
        Rotate the stack. This moves the orginal value of the counter to the top of the stack.<br>
        <code>3%:</code><br>
        Push the modulo of the counter to the top of the stack, twice. Now the stack looks like this:
        <code>c c%5 c%5 c%3 c%3</code> where c is the counter.<br>
        <code>@*?</code><br>
        Move the top of the stack back by 2. Stack now looks like <code>c c%5 c%3 c%5</code>. We multiply the top 2 values to create a AND. If both are true, AKA non-divisble, we go down.<br>
        <code>~~:n</code><br>
        Pop extranious elements from the stack and print the number. We only reach this path if the counter is not divisible by anything.
        <code>ao^</code><br>
        Print a line break, then go up to start the loop again.<br>
        <code>?/</code>
        If the number is divisible by 3 OR 5 and it is NOT divisible by 3, go up.  This means the number must be divisible by 5 only.
        <code>~'zzuB'oooo</code><br>
        Print "Buzz"<br>
        <code>aov</code><br>
        Print a line break and restart the loop.<br>
        <code>'zziF'oooo/</code><br>
        Print "Fizz". We only reach this state if we are divisible by 3.<br>
        <code>:0=?/</code><br>
        If we are also divisble by 5, go down then left, to the part of the code that already prints <code>Buzz</code>`
    },
    {
        name: "Fibonacci",
        code: "10::n' 'o&+&$10.",
        explanation: `<h3>Fibonacci<h3>
        <p>
        The fibonochi sequence starts with 0 1. Then each subsequent value is the sum of the previous 2 values.
        <a href="https://en.wikipedia.org/wiki/Fibonacci_number">Learn more about the sequence on wikipedia</a>
        </p>

        <p>This program will infinitly print the elements of the sequence, or at least until numerical limits are exceeded. (Fish uses 64-bit floating points)</p>

        <code>10</code><br>
        Push the first 2 elements to the stack. This means the first element is last on the stack and the next is second to last.<br>

        <code>::n</code><br>
        Copy the last element of the sequence twice print it<br>

        <code>' 'o</code><br>
        Print a space<br>

        <code>&+&</code><br>
        This temporairly moves the top element of the stack to the register.<br>

        <code>$</code><br>
        Swap the 2 elements of the stack. This leaves the next item on the top and the one after at the bottom.

        <code>10.</code><br>
        This will jump to the coordinates <code>1,0</code>. However, since the cursor will immediatly move one step after jumpting the first executed instruction will actually be <code>2, 0</code>. This restarts the loop.<br>
        `
    },
    {
        name: "Lucas",
        code: "2n' 'ol?/21>::!\n    $&+&\\  /",
        explanation: `
        <h3>The Lukas Sequence</h3>
        <p>The lukas sequence, like the Fibonacci sequence, has the property that <code>L(x) = L(x-1) + L(x-2)</code>. However, unlike Fibonacci it starts with <code>2, 1</code>.
        <a href="https://en.wikipedia.org/wiki/Lucas_number">Learn more about Lukas numbers on Wikipedia</a></p>
        <p>This code will infintly print elements of the Lukas sequence. While it would be possible to use the same kind of program as Fibbonacci this uses a different approach.</p>

        <code>2n</code><br>
        Print the number "2"<br>
        <code>' 'o</code><br>
        Print a space.<br>
        <code>l?/<code><br>
        If the stack has at least one element, go up. Since the stack has only 2 elements this effectively wraps around to be the same as going down.<br>
        <code>21&gt;</code>
        If the stack is empty, push <code>2, 1</code> to the stack, then go right<br>
        <code>&+&</code><br>
        Add the second and third items of the stack, using the register to temporairly  hold the first<br>
        <code>$</code><br>
        Swap the top of the stack, thus moving the sum to the top and the previous first item down.<br>
        <code>/</code><br>
        Move down, of effectively up.<br>
        <code>&gt;::!</code><br>
        Make sure the direction is right. If so duplicate the top of the stack twice. Then <code>!<code>skips the next intruction which would be the <code>2</code>,
        thus printing the number then going to the space printing part.<br>

        `
    },
    {
        name: "Factorial",
        code: " :?\\~11>*l1\\\n-1:/ ;n\\?- /",
        explanation: `<h3>The Factorial Function</h3>
        <p>The factorial of a number is defined as the product of all numbers 1 to N. <a href="https://en.wikipedia.org/wiki/Factorial">Learn more about factorial numbers on Wikipedia</a>

        <p>This computes the factorial of a number entered via the "initial stack" option.<p>

        <code>:?\</code><br>
        If the number is not 0, go down</code>

        <code>:1-</code><br>
        If the input is not 0, Push the number -1 to the stack.<br>
        </code>~11</code>
        If the input <i>is</i> 0, delete the input and push <code>11</code>instead.<br>
        <code>/\</code>
        If the input was <i>not</i>0, jump to the start. We try again starting from <code>n-1</code>. The number may now have become 0.<br>
        <code>*l1-?</code>
        If the last number <i>was</i>0, the 0 has been popped. So we multiply the top 2 elemnents of the stack. Then theck if the length is 2 or greater. If so,
        repeat the multiplication.<br>
        <code>n;</code>
        If only 1 element is left, we print it and exit<br>
        `
    },
    {
        name: "Quine",
        code: "\"r00gol?!;40."
    },
    {
        name: "Square Root",
        code: "1[:>:r:@@:@,\\;\n]~$\\!?={:,2+/n"
    },
    {
        name: "Extract Questions",
        code: ">i:0(?^:\"?\"=?v\\\"!.\"@=?v=?v\n^>l?v00. > ovr:    .12<  <\n ^ ~< ;!0^?l<<:"
    },
    {
        name: "Maximum Average Ord",
        code: "00001.\n$i:\"!\"(?v+$1+\n:$@:$,$&/(@\nv?(0&~$?/|.!00\n\\n;"
    },
    {
        name: "Inventory Sequence",
        code: "0:1g:::n1g1+$1pao$:01-r?r-$~00."
    }
]