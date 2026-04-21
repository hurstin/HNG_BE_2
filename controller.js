export const getWorld = (req, res) => {
    res.status(200).json({
        name: 'austin',
        message:'hello world'
    })
}