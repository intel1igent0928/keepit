def check_braces(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    stack = []
    for i, char in enumerate(content):
        if char == '{':
            stack.append(i)
        elif char == '}':
            if not stack:
                print(f"Unmatched closing brace at position {i}")
                return False
            stack.pop()
    
    if stack:
        for pos in stack:
            print(f"Unmatched opening brace at position {pos}")
        return False
    
    print("Braces are balanced.")
    return True

check_braces('d:/Abdulboriy/iT Comfort/KeepIt/styles.css')
