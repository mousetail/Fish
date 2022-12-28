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
        <code>:0=?/</code>
        If we are also divisble by 5, go down then left, to the part of the code that already prints <code>Buzz</code>`
    },
    {
        name: "Fibonacci",
        code: "10::n' 'o&+&$10."
    },
    {
        name: "Lucas",
        code: "2n' 'ol?/21>::!\n    $&+&\\  /"
    },
    {
        name: "Factorial",
        code: " :?\\~11>*l1\\\n-1:/ ;n\\?- /"
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